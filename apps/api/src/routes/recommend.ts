/**
 * Recommendation API Routes
 * 
 * Endpoints for generating AI-powered study aids from notes:
 * - POST /api/recommend/mindmap - Generate mindmap
 * - POST /api/recommend/flashcards - Generate flashcards
 * - POST /api/recommend/concepts - Generate concept breakdown
 * - POST /api/recommend/exercises - Generate exercises
 * - GET /api/recommend/:noteId/all - Get all recommendations
 * 
 * Phase 3.2 Implementation as per next_phases_plan.md
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireAuth } from '../middleware/auth'

const recommend = new Hono()

// Apply auth middleware
recommend.use('*', authMiddleware)

// ============================================================================
// Request Schemas
// ============================================================================

const NoteIdSchema = z.object({
    noteId: z.string().uuid(),
})

// ============================================================================
// Helper: Fetch note content
// ============================================================================

async function fetchNoteContent(
    noteId: string,
    supabase: ReturnType<typeof requireAuth>['supabase'],
    userId: string
): Promise<{ title: string; content: string } | null> {
    const { data, error } = await supabase
        .from('notes')
        .select('title, content')
        .eq('id', noteId)
        .eq('is_deleted', false)
        .single()

    if (error || !data) return null
    return data as { title: string; content: string }
}

// ============================================================================
// POST /api/recommend/mindmap
// ============================================================================

recommend.post(
    '/mindmap',
    zValidator('json', NoteIdSchema),
    async (c) => {
        const auth = requireAuth(c)
        const { noteId } = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const note = await fetchNoteContent(noteId, auth.supabase, auth.userId)
        if (!note) {
            return c.json({ error: 'Note not found' }, 404)
        }

        try {
            const { createRecommendationService } = await import('@inkdown/ai/services')
            const service = createRecommendationService({ openaiApiKey })
            const mindmap = await service.generateMindmap(noteId, note.content, note.title)
            return c.json(mindmap)
        } catch (err) {
            return c.json({ error: String(err) }, 500)
        }
    }
)

// ============================================================================
// POST /api/recommend/flashcards
// ============================================================================

recommend.post(
    '/flashcards',
    zValidator('json', NoteIdSchema),
    async (c) => {
        const auth = requireAuth(c)
        const { noteId } = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const note = await fetchNoteContent(noteId, auth.supabase, auth.userId)
        if (!note) {
            return c.json({ error: 'Note not found' }, 404)
        }

        try {
            const { createRecommendationService } = await import('@inkdown/ai/services')
            const service = createRecommendationService({ openaiApiKey })
            const flashcards = await service.generateFlashcards(noteId, note.content, note.title)
            return c.json(flashcards)
        } catch (err) {
            return c.json({ error: String(err) }, 500)
        }
    }
)

// ============================================================================
// POST /api/recommend/concepts
// ============================================================================

recommend.post(
    '/concepts',
    zValidator('json', NoteIdSchema),
    async (c) => {
        const auth = requireAuth(c)
        const { noteId } = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const note = await fetchNoteContent(noteId, auth.supabase, auth.userId)
        if (!note) {
            return c.json({ error: 'Note not found' }, 404)
        }

        try {
            const { createRecommendationService } = await import('@inkdown/ai/services')
            const service = createRecommendationService({ openaiApiKey })
            const concepts = await service.generateConcepts(noteId, note.content, note.title)
            return c.json(concepts)
        } catch (err) {
            return c.json({ error: String(err) }, 500)
        }
    }
)

// ============================================================================
// POST /api/recommend/exercises
// ============================================================================

recommend.post(
    '/exercises',
    zValidator('json', NoteIdSchema),
    async (c) => {
        const auth = requireAuth(c)
        const { noteId } = c.req.valid('json')
        const openaiApiKey = process.env.OPENAI_API_KEY

        if (!openaiApiKey) {
            return c.json({ error: 'OpenAI API key not configured' }, 500)
        }

        const note = await fetchNoteContent(noteId, auth.supabase, auth.userId)
        if (!note) {
            return c.json({ error: 'Note not found' }, 404)
        }

        try {
            const { createRecommendationService } = await import('@inkdown/ai/services')
            const service = createRecommendationService({ openaiApiKey })
            const exercises = await service.generateExercises(noteId, note.content, note.title)
            return c.json(exercises)
        } catch (err) {
            return c.json({ error: String(err) }, 500)
        }
    }
)

// ============================================================================
// GET /api/recommend/:noteId/all
// ============================================================================

recommend.get('/:noteId/all', async (c) => {
    const auth = requireAuth(c)
    const noteId = c.req.param('noteId')
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
        return c.json({ error: 'OpenAI API key not configured' }, 500)
    }

    // Validate UUID
    if (!z.string().uuid().safeParse(noteId).success) {
        return c.json({ error: 'Invalid note ID' }, 400)
    }

    const note = await fetchNoteContent(noteId, auth.supabase, auth.userId)
    if (!note) {
        return c.json({ error: 'Note not found' }, 404)
    }

    try {
        const { createRecommendationService } = await import('@inkdown/ai/services')
        const service = createRecommendationService({ openaiApiKey })
        const all = await service.generateAll(noteId, note.content, note.title)
        return c.json(all)
    } catch (err) {
        return c.json({ error: String(err) }, 500)
    }
})

export default recommend
