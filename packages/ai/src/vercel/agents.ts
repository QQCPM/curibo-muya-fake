/**
 * Vercel AI SDK Agent Implementations
 * 
 * Simplified agents using Vercel AI SDK's generateText() and streamText().
 * Uses GPT-5.2 for all agent operations with automatic tool execution loops.
 * 
 * Agents:
 * - Secretary: Intent routing with tool calling
 * - Chat: Conversational AI with RAG
 * - Note: Note manipulation (create, update, organize, summarize, expand)
 * - Planner: Goal decomposition and planning
 */

import { generateText, streamText, CoreMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import {
    createVercelTools,
    getSecretaryTools,
    getCoreTools,
    type VercelToolContext
} from './tools'

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MODEL = 'gpt-5.2'
const DEFAULT_MAX_STEPS = 10

export interface AgentConfig {
    supabase: SupabaseClient
    userId: string
    openaiApiKey: string
    model?: string
    maxSteps?: number
}

// ============================================================================
// Secretary Agent
// ============================================================================

const SECRETARY_SYSTEM_PROMPT = `You are an intelligent AI secretary for a note-taking and learning application.

Your capabilities:
1. **Chat** - Answer questions, have conversations, provide explanations
2. **Note Management** - Read, edit, create notes using tools
3. **Memory Management** - Read/write user preferences, plans, and context
4. **Roadmap Planning** - Create and manage learning roadmaps
5. **Artifacts** - Create interactive HTML/CSS/JS visualizations

Classification guidelines:
- For questions or general chat, respond conversationally 
- For note operations, use read_note or edit_block tools
- For memory queries, use read_memory_file or write_memory_file
- For planning requests, use create_roadmap or get_roadmap tools
- For visualization requests, use create_artifact

Always be helpful, concise, and accurate. Use tools when they would help answer the user's request.`

export interface SecretaryInput {
    message: string
    context?: {
        currentNoteId?: string
        projectId?: string
        noteIds?: string[]
    }
    sessionId?: string
    history?: CoreMessage[]
}

export interface SecretaryResult {
    content: string
    toolCalls?: Array<{
        toolName: string
        args: unknown
        result: unknown
    }>
}

/**
 * Run the secretary agent (non-streaming)
 * Uses GPT-5.2 with automatic tool execution via maxSteps
 */
export async function runSecretary(
    input: SecretaryInput,
    config: AgentConfig
): Promise<SecretaryResult> {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })
    const toolContext: VercelToolContext = {
        supabase: config.supabase,
        userId: config.userId,
    }

    const tools = getSecretaryTools(toolContext)

    // Build message history
    const messages: CoreMessage[] = [
        ...(input.history || []),
        { role: 'user', content: input.message },
    ]

    // Add context to system prompt if available
    let systemPrompt = SECRETARY_SYSTEM_PROMPT
    if (input.context?.currentNoteId) {
        systemPrompt += `\n\nContext: User is currently viewing note ID: ${input.context.currentNoteId}`
    }

    const result = await generateText({
        model: openai(config.model || DEFAULT_MODEL),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: config.maxSteps || DEFAULT_MAX_STEPS,
    })

    return {
        content: result.text,
        toolCalls: result.steps.flatMap(step =>
            step.toolCalls?.map(tc => ({
                toolName: tc.toolName,
                args: tc.args,
                result: step.toolResults?.find(tr => tr.toolCallId === tc.toolCallId)?.result,
            })) || []
        ),
    }
}

/**
 * Stream the secretary agent response
 * Returns Vercel AI SDK stream for direct use with API responses
 */
export async function streamSecretary(
    input: SecretaryInput,
    config: AgentConfig
) {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })
    const toolContext: VercelToolContext = {
        supabase: config.supabase,
        userId: config.userId,
    }

    const tools = getSecretaryTools(toolContext)

    const messages: CoreMessage[] = [
        ...(input.history || []),
        { role: 'user', content: input.message },
    ]

    let systemPrompt = SECRETARY_SYSTEM_PROMPT
    if (input.context?.currentNoteId) {
        systemPrompt += `\n\nContext: User is currently viewing note ID: ${input.context.currentNoteId}`
    }

    return streamText({
        model: openai(config.model || DEFAULT_MODEL),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: config.maxSteps || DEFAULT_MAX_STEPS,
    })
}

// ============================================================================
// Chat Agent
// ============================================================================

const CHAT_SYSTEM_PROMPT = `You are a helpful AI assistant for note-taking and learning.
Be helpful, accurate, and concise. When you use information from the provided context,
cite it using [1], [2], etc. to reference the source.`

export interface ChatInput {
    message: string
    context?: {
        noteIds?: string[]
        projectId?: string
        currentNoteId?: string
    }
    history?: CoreMessage[]
    includeRag?: boolean
    ragChunks?: Array<{
        noteId: string
        noteTitle: string
        chunkText: string
        similarity: number
    }>
}

export interface ChatResult {
    content: string
    citations?: Array<{
        number: number
        noteId: string
        title: string
        snippet: string
    }>
}

/**
 * Run the chat agent (non-streaming)
 */
export async function runChat(
    input: ChatInput,
    config: AgentConfig
): Promise<ChatResult> {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })
    const toolContext: VercelToolContext = {
        supabase: config.supabase,
        userId: config.userId,
    }

    const tools = getCoreTools(toolContext)

    // Build system prompt with RAG context if available
    let systemPrompt = CHAT_SYSTEM_PROMPT
    const citations: ChatResult['citations'] = []

    if (input.ragChunks && input.ragChunks.length > 0) {
        systemPrompt += '\n\n## Relevant Context from User\'s Notes:\n\n'
        input.ragChunks.forEach((chunk, i) => {
            systemPrompt += `[${i + 1}] From "${chunk.noteTitle}":\n${chunk.chunkText}\n\n`
            citations.push({
                number: i + 1,
                noteId: chunk.noteId,
                title: chunk.noteTitle,
                snippet: chunk.chunkText.slice(0, 150) + '...',
            })
        })
    }

    const messages: CoreMessage[] = [
        ...(input.history || []),
        { role: 'user', content: input.message },
    ]

    const result = await generateText({
        model: openai(config.model || DEFAULT_MODEL),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: 5, // Chat typically needs fewer steps
    })

    return {
        content: result.text,
        citations: citations.length > 0 ? citations : undefined,
    }
}

/**
 * Stream the chat agent response
 */
export async function streamChat(
    input: ChatInput,
    config: AgentConfig
) {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })
    const toolContext: VercelToolContext = {
        supabase: config.supabase,
        userId: config.userId,
    }

    const tools = getCoreTools(toolContext)

    let systemPrompt = CHAT_SYSTEM_PROMPT

    if (input.ragChunks && input.ragChunks.length > 0) {
        systemPrompt += '\n\n## Relevant Context from User\'s Notes:\n\n'
        input.ragChunks.forEach((chunk, i) => {
            systemPrompt += `[${i + 1}] From "${chunk.noteTitle}":\n${chunk.chunkText}\n\n`
        })
    }

    const messages: CoreMessage[] = [
        ...(input.history || []),
        { role: 'user', content: input.message },
    ]

    return streamText({
        model: openai(config.model || DEFAULT_MODEL),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: 5,
    })
}

// ============================================================================
// Note Agent
// ============================================================================

type NoteAction = 'create' | 'update' | 'organize' | 'summarize' | 'expand'

const NOTE_ACTION_PROMPTS: Record<NoteAction, string> = {
    create: `You are a note creation assistant. Based on the user's input, create a well-structured note.
Include:
- A clear, descriptive title (start with # Title)
- Well-organized content with appropriate headings
- Bullet points or numbered lists where appropriate

Output ONLY the note content in Markdown format. Start with # Title on the first line.`,

    update: `You are a note editing assistant. The user wants to update their note based on their instructions.
Preserve the note's core structure unless specifically asked to change it.
Make the requested changes clearly and cleanly.

Output ONLY the updated note content in Markdown format.`,

    organize: `You are a note organization assistant. Restructure the provided note to be clearer and better organized.
- Improve heading structure
- Group related content
- Add bullet points where appropriate
- Fix formatting issues

Output ONLY the reorganized note content in Markdown format.`,

    summarize: `You are a summarization assistant. Create a concise summary of the provided note.
- Capture the key points
- Maintain clarity and accuracy
- Use bullet points for main ideas
- Keep it under 200 words unless the source is very long

Output ONLY the summary in Markdown format.`,

    expand: `You are a content expansion assistant. Expand on the provided note with more detail.
- Add explanations where concepts are unclear
- Provide examples where helpful
- Expand bullet points into full paragraphs if appropriate
- Add related information that would be valuable

Output ONLY the expanded note content in Markdown format.`,
}

export interface NoteInput {
    action: NoteAction
    input: string
    noteId?: string
    projectId?: string
    existingContent?: string
    existingTitle?: string
}

export interface NoteResult {
    success: boolean
    content?: string
    title?: string
    noteId?: string
    error?: string
}

/**
 * Run the note agent (non-streaming)
 */
export async function runNote(
    input: NoteInput,
    config: AgentConfig
): Promise<NoteResult> {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })

    const systemPrompt = NOTE_ACTION_PROMPTS[input.action]

    // Build user content
    let userContent = input.input
    if (input.existingContent && input.action !== 'create') {
        userContent = `Current note content:\n\n${input.existingContent}\n\n---\n\nUser instructions: ${input.input}`
    }

    try {
        const result = await generateText({
            model: openai(config.model || DEFAULT_MODEL),
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
        })

        const content = result.text
        const title = extractTitle(content)

        // Save to database if creating or updating
        if (input.action === 'create') {
            const { data: newNote, error } = await config.supabase
                .from('notes')
                .insert({
                    user_id: config.userId,
                    project_id: input.projectId,
                    title: title || 'Untitled Note',
                    content,
                })
                .select('id')
                .single()

            if (error) {
                return { success: false, error: error.message }
            }

            return {
                success: true,
                content,
                title: title || 'Untitled Note',
                noteId: (newNote as { id: string }).id,
            }
        } else if (input.noteId) {
            const updateData: Record<string, string> = { content }
            if (title) updateData.title = title

            const { error } = await config.supabase
                .from('notes')
                .update(updateData)
                .eq('id', input.noteId)
                .eq('user_id', config.userId)

            if (error) {
                return { success: false, error: error.message }
            }

            return { success: true, content, title, noteId: input.noteId }
        }

        // For summarize without saving
        return { success: true, content, title }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Stream the note agent response
 */
export async function streamNote(
    input: NoteInput,
    config: AgentConfig
) {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })

    const systemPrompt = NOTE_ACTION_PROMPTS[input.action]

    let userContent = input.input
    if (input.existingContent && input.action !== 'create') {
        userContent = `Current note content:\n\n${input.existingContent}\n\n---\n\nUser instructions: ${input.input}`
    }

    return streamText({
        model: openai(config.model || DEFAULT_MODEL),
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
    })
}

// ============================================================================
// Planner Agent
// ============================================================================

const PLANNER_SYSTEM_PROMPT = `You are a planning assistant that helps break down goals into actionable steps.

When given a goal, create a structured plan with:
1. A brief summary of the approach
2. 3-10 concrete, actionable steps
3. Estimated time for each step (optional)
4. Dependencies between steps (optional)

Return your plan as valid JSON with this structure:
{
  "summary": "Brief description of the plan approach",
  "steps": [
    {
      "id": 1,
      "description": "Step description",
      "estimatedTime": "30 minutes",
      "dependencies": []
    }
  ]
}

Only output valid JSON, no markdown code blocks or explanation.`

export interface PlannerInput {
    goal: string
    context?: string
    constraints?: string[]
    maxSteps?: number
}

export interface PlanStep {
    id: number
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    estimatedTime?: string
    dependencies?: number[]
    result?: string
}

export interface Plan {
    id: string
    goal: string
    summary: string
    steps: PlanStep[]
    status: 'draft' | 'active' | 'completed' | 'paused'
    createdAt: Date
    updatedAt: Date
}

export interface PlannerResult {
    success: boolean
    plan?: Plan
    message: string
    error?: string
}

/**
 * Create a plan using the planner agent
 */
export async function createPlan(
    input: PlannerInput,
    config: AgentConfig
): Promise<PlannerResult> {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })

    let prompt = `Goal: ${input.goal}`
    if (input.context) {
        prompt += `\n\nContext: ${input.context}`
    }
    if (input.constraints && input.constraints.length > 0) {
        prompt += `\n\nConstraints:\n${input.constraints.map(c => `- ${c}`).join('\n')}`
    }
    if (input.maxSteps) {
        prompt += `\n\nMaximum steps: ${input.maxSteps}`
    }

    try {
        const result = await generateText({
            model: openai(config.model || DEFAULT_MODEL),
            system: PLANNER_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
        })

        // Parse the JSON response
        const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

        const plan: Plan = {
            id: crypto.randomUUID(),
            goal: input.goal,
            summary: parsed.summary,
            steps: parsed.steps.map((s: { id: number; description: string; estimatedTime?: string; dependencies?: number[] }) => ({
                ...s,
                status: 'pending' as const,
            })),
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        return {
            success: true,
            plan,
            message: `Created plan with ${plan.steps.length} steps`,
        }
    } catch (err) {
        return {
            success: false,
            message: 'Failed to create plan',
            error: String(err),
        }
    }
}

/**
 * Stream plan creation (for progressive display)
 */
export async function streamPlan(
    input: PlannerInput,
    config: AgentConfig
) {
    const openai = createOpenAI({ apiKey: config.openaiApiKey })

    let prompt = `Goal: ${input.goal}`
    if (input.context) {
        prompt += `\n\nContext: ${input.context}`
    }
    if (input.constraints && input.constraints.length > 0) {
        prompt += `\n\nConstraints:\n${input.constraints.map(c => `- ${c}`).join('\n')}`
    }
    if (input.maxSteps) {
        prompt += `\n\nMaximum steps: ${input.maxSteps}`
    }

    return streamText({
        model: openai(config.model || DEFAULT_MODEL),
        system: PLANNER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
    })
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractTitle(content: string): string | undefined {
    const firstLine = content.split('\n')[0]
    if (firstLine.startsWith('# ')) {
        return firstLine.replace('# ', '').trim()
    }
    return undefined
}
