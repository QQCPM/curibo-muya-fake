/**
 * Vercel AI SDK Agent Routes
 * 
 * Simplified agent routes using Vercel AI SDK's streamText() and generateText().
 * Uses GPT-5.2 for all agents with automatic tool execution via maxSteps.
 * 
 * These routes replace the class-based agent routes with a cleaner, simpler implementation.
 */

import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireAuth } from '../middleware/auth'

const vercelAgent = new Hono()

// Apply auth middleware
vercelAgent.use('*', authMiddleware)

// ============================================================================
// Request Schemas
// ============================================================================

const SecretaryRequestSchema = z.object({
    message: z.string().min(1).max(10000),
    context: z.object({
        currentNoteId: z.string().uuid().optional(),
        projectId: z.string().uuid().optional(),
        noteIds: z.array(z.string().uuid()).optional(),
    }).optional(),
    sessionId: z.string().uuid().optional(),
    stream: z.boolean().default(true),
})

const ChatRequestSchema = z.object({
    message: z.string().min(1).max(10000),
    context: z.object({
        noteIds: z.array(z.string().uuid()).optional(),
        projectId: z.string().uuid().optional(),
        currentNoteId: z.string().uuid().optional(),
    }).optional(),
    includeRag: z.boolean().default(true),
    stream: z.boolean().default(true),
})

const NoteRequestSchema = z.object({
    action: z.enum(['create', 'update', 'organize', 'summarize', 'expand']),
    input: z.string().min(1).max(50000),
    noteId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    stream: z.boolean().default(true),
})

const PlannerRequestSchema = z.object({
    goal: z.string().min(1).max(2000),
    context: z.string().optional(),
    constraints: z.array(z.string()).optional(),
    maxSteps: z.number().int().min(1).max(20).optional(),
    stream: z.boolean().default(true),
})

// ============================================================================
// Secretary Agent - Vercel AI SDK
// ============================================================================

/**
 * Secretary agent with intelligent tool routing
 * POST /api/v2/agent/secretary
 */
vercelAgent.post(
    '/secretary',
    zValidator('json', SecretaryRequestSchema),
    async (c) => {
        const auth = requireAuth(c)
        const body = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        // Import Vercel AI SDK agents
        const { runSecretary, streamSecretary } = await import('@inkdown/ai/vercel')

        const config = {
            supabase: auth.supabase,
            userId: auth.userId,
            openaiApiKey,
        }

        if (body.stream) {
            return streamSSE(c, async (stream) => {
                try {
                    const result = await streamSecretary({
                        message: body.message,
                        context: body.context,
                        sessionId: body.sessionId,
                    }, config)

                    // Stream text deltas
                    for await (const chunk of result.textStream) {
                        await stream.writeSSE({
                            data: JSON.stringify({ type: 'text-delta', data: chunk }),
                        })
                    }

                    // Signal completion
                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'finish', data: { reason: 'stop' } }),
                    })
                } catch (err) {
                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'error', data: String(err) }),
                    })
                }
            })
        }

        // Non-streaming
        const result = await runSecretary({
            message: body.message,
            context: body.context,
            sessionId: body.sessionId,
        }, config)

        return c.json(result)
    }
)

// ============================================================================
// Chat Agent - Vercel AI SDK
// ============================================================================

/**
 * Chat agent with RAG support
 * POST /api/v2/agent/chat
 */
vercelAgent.post(
    '/chat',
    zValidator('json', ChatRequestSchema),
    async (c) => {
        const auth = requireAuth(c)
        const body = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const { runChat, streamChat } = await import('@inkdown/ai/vercel')

        const config = {
            supabase: auth.supabase,
            userId: auth.userId,
            openaiApiKey,
        }

        // Perform RAG if enabled
        let ragChunks: Array<{
            noteId: string
            noteTitle: string
            chunkText: string
            similarity: number
        }> = []

        if (body.includeRag) {
            try {
                // Use EmbeddingService for RAG search
                const { createEmbeddingService } = await import('@inkdown/ai/services')

                const embeddingService = createEmbeddingService({
                    supabase: auth.supabase,
                    userId: auth.userId,
                    openaiApiKey,
                })

                const results = await embeddingService.searchSimilar(body.message, {
                    limit: 5,
                    threshold: 0.7,
                    projectId: body.context?.projectId,
                    noteIds: body.context?.noteIds,
                })

                ragChunks = results.map(r => ({
                    noteId: r.noteId,
                    noteTitle: r.noteTitle,
                    chunkText: r.chunkText,
                    similarity: r.similarity,
                }))
            } catch (err) {
                // RAG failed, continue without it
                console.warn('RAG search failed:', err)
            }
        }

        if (body.stream) {
            return streamSSE(c, async (stream) => {
                try {
                    const result = await streamChat({
                        message: body.message,
                        context: body.context,
                        ragChunks,
                    }, config)

                    for await (const chunk of result.textStream) {
                        await stream.writeSSE({
                            data: JSON.stringify({ type: 'text-delta', data: chunk }),
                        })
                    }

                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'finish', data: { reason: 'stop' } }),
                    })
                } catch (err) {
                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'error', data: String(err) }),
                    })
                }
            })
        }

        const result = await runChat({
            message: body.message,
            context: body.context,
            ragChunks,
        }, config)

        return c.json(result)
    }
)

// ============================================================================
// Note Agent - Vercel AI SDK
// ============================================================================

/**
 * Note manipulation agent
 * POST /api/v2/agent/note
 */
vercelAgent.post(
    '/note',
    zValidator('json', NoteRequestSchema),
    async (c) => {
        const auth = requireAuth(c)
        const body = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const { runNote, streamNote } = await import('@inkdown/ai/vercel')

        const config = {
            supabase: auth.supabase,
            userId: auth.userId,
            openaiApiKey,
        }

        // Fetch existing note content if updating
        let existingContent: string | undefined
        let existingTitle: string | undefined

        if (body.noteId && ['update', 'organize', 'summarize', 'expand'].includes(body.action)) {
            const { data: note } = await auth.supabase
                .from('notes')
                .select('title, content')
                .eq('id', body.noteId)
                .eq('user_id', auth.userId)
                .single()

            if (note) {
                existingContent = (note as { title: string; content: string }).content
                existingTitle = (note as { title: string; content: string }).title
            }
        }

        if (body.stream) {
            return streamSSE(c, async (stream) => {
                try {
                    const result = await streamNote({
                        action: body.action,
                        input: body.input,
                        noteId: body.noteId,
                        projectId: body.projectId,
                        existingContent,
                        existingTitle,
                    }, config)

                    let fullContent = ''

                    for await (const chunk of result.textStream) {
                        fullContent += chunk
                        await stream.writeSSE({
                            data: JSON.stringify({ type: 'text-delta', data: chunk }),
                        })
                    }

                    // Save the note after streaming completes
                    let noteId = body.noteId
                    const title = extractTitle(fullContent) || existingTitle || 'Untitled Note'

                    if (body.action === 'create') {
                        const { data: newNote } = await auth.supabase
                            .from('notes')
                            .insert({
                                user_id: auth.userId,
                                project_id: body.projectId,
                                title,
                                content: fullContent,
                            })
                            .select('id')
                            .single()

                        noteId = (newNote as { id: string } | null)?.id
                    } else if (noteId) {
                        await auth.supabase
                            .from('notes')
                            .update({
                                content: fullContent,
                                title: extractTitle(fullContent) || undefined,
                            })
                            .eq('id', noteId)
                            .eq('user_id', auth.userId)
                    }

                    await stream.writeSSE({
                        data: JSON.stringify({
                            type: 'finish',
                            data: { success: true, noteId, title }
                        }),
                    })
                } catch (err) {
                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'error', data: String(err) }),
                    })
                }
            })
        }

        const result = await runNote({
            action: body.action,
            input: body.input,
            noteId: body.noteId,
            projectId: body.projectId,
            existingContent,
            existingTitle,
        }, config)

        return c.json(result)
    }
)

// ============================================================================
// Planner Agent - Vercel AI SDK
// ============================================================================

/**
 * Create a plan
 * POST /api/v2/agent/planner/plan
 */
vercelAgent.post(
    '/planner/plan',
    zValidator('json', PlannerRequestSchema),
    async (c) => {
        const auth = requireAuth(c)
        const body = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const { createPlan, streamPlan } = await import('@inkdown/ai/vercel')

        const config = {
            supabase: auth.supabase,
            userId: auth.userId,
            openaiApiKey,
        }

        if (body.stream) {
            return streamSSE(c, async (stream) => {
                try {
                    const result = await streamPlan({
                        goal: body.goal,
                        context: body.context,
                        constraints: body.constraints,
                        maxSteps: body.maxSteps,
                    }, config)

                    for await (const chunk of result.textStream) {
                        await stream.writeSSE({
                            data: JSON.stringify({ type: 'text-delta', data: chunk }),
                        })
                    }

                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'finish', data: { reason: 'stop' } }),
                    })
                } catch (err) {
                    await stream.writeSSE({
                        data: JSON.stringify({ type: 'error', data: String(err) }),
                    })
                }
            })
        }

        const result = await createPlan({
            goal: body.goal,
            context: body.context,
            constraints: body.constraints,
            maxSteps: body.maxSteps,
        }, config)

        return c.json(result)
    }
)

// ============================================================================
// Capabilities Endpoint
// ============================================================================

/**
 * Get API version and capabilities
 * GET /api/v2/agent/capabilities
 */
vercelAgent.get('/capabilities', async (c) => {
    return c.json({
        version: '2.0',
        framework: 'Vercel AI SDK 6',
        model: 'gpt-5.2',
        agents: [
            {
                type: 'secretary',
                name: 'Secretary Agent',
                description: 'Intent routing with 26 tools',
                capabilities: ['classify', 'route', 'tools', 'memory', 'roadmaps'],
            },
            {
                type: 'chat',
                name: 'Chat Agent',
                description: 'Conversational AI with RAG',
                capabilities: ['chat', 'rag', 'citations', 'context'],
            },
            {
                type: 'note',
                name: 'Note Agent',
                description: 'Note manipulation',
                capabilities: ['create', 'update', 'organize', 'summarize', 'expand'],
            },
            {
                type: 'planner',
                name: 'Planner Agent',
                description: 'Goal decomposition',
                capabilities: ['plan', 'decompose', 'track', 'guide'],
            },
        ],
    })
})

// ============================================================================
// Helpers
// ============================================================================

function extractTitle(content: string): string | undefined {
    const firstLine = content.split('\n')[0]
    if (firstLine.startsWith('# ')) {
        return firstLine.replace('# ', '').trim()
    }
    return undefined
}

export default vercelAgent
