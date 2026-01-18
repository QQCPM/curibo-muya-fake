/**
 * Embedding Service Tests
 * 
 * Tests for the EmbeddingService used for RAG.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmbeddingService, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '../services/embedding'

// Mock the OpenAI import
vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        embeddings: {
            create: vi.fn().mockResolvedValue({
                data: [{ embedding: new Array(1536).fill(0.1) }],
            }),
        },
    })),
}))

// Mock Supabase client
const createMockSupabase = () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({
        data: [
            {
                note_id: 'note-1',
                note_title: 'Test Note',
                chunk_text: 'Some test content about the topic.',
                similarity: 0.85,
                project_id: null,
            },
        ],
        error: null
    }),
})

describe('EmbeddingService', () => {
    let mockSupabase: ReturnType<typeof createMockSupabase>
    let service: EmbeddingService

    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase = createMockSupabase()
        service = new EmbeddingService({
            supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
            userId: 'test-user-id',
            openaiApiKey: 'test-api-key',
        })
    })

    describe('Constants', () => {
        it('should use correct embedding model', () => {
            expect(EMBEDDING_MODEL).toBe('text-embedding-3-large')
        })

        it('should use 1536 dimensions for pgvector', () => {
            expect(EMBEDDING_DIMENSIONS).toBe(1536)
        })
    })

    describe('generateEmbedding', () => {
        it('should generate embedding with correct dimensions', async () => {
            const embedding = await service.generateEmbedding('test text')

            expect(embedding).toBeDefined()
            expect(Array.isArray(embedding)).toBe(true)
            expect(embedding.length).toBe(1536)
        })
    })

    describe('generateEmbeddings', () => {
        it('should return empty array for empty input', async () => {
            const embeddings = await service.generateEmbeddings([])
            expect(embeddings).toEqual([])
        })
    })

    describe('searchSimilar', () => {
        it('should return RAG chunks from search', async () => {
            const results = await service.searchSimilar('test query')

            expect(results).toBeDefined()
            expect(Array.isArray(results)).toBe(true)
        })

        it('should call RPC with correct parameters', async () => {
            await service.searchSimilar('test query', {
                limit: 3,
                threshold: 0.8,
            })

            expect(mockSupabase.rpc).toHaveBeenCalledWith('search_embeddings', expect.objectContaining({
                match_count: 3,
                match_threshold: 0.8,
                p_user_id: 'test-user-id',
            }))
        })

        it('should filter by project ID when provided', async () => {
            // Mock returns results with project_id
            mockSupabase.rpc.mockResolvedValueOnce({
                data: [
                    { note_id: 'n1', note_title: 'T1', chunk_text: 'text', similarity: 0.9, project_id: 'proj-1' },
                    { note_id: 'n2', note_title: 'T2', chunk_text: 'text', similarity: 0.8, project_id: 'proj-2' },
                ],
                error: null,
            })

            const results = await service.searchSimilar('query', {
                projectId: 'proj-1',
            })

            // Should filter to only proj-1
            expect(results.length).toBe(1)
            expect(results[0].noteId).toBe('n1')
        })

        it('should filter by note IDs when provided', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({
                data: [
                    { note_id: 'n1', note_title: 'T1', chunk_text: 'text', similarity: 0.9 },
                    { note_id: 'n2', note_title: 'T2', chunk_text: 'text', similarity: 0.8 },
                    { note_id: 'n3', note_title: 'T3', chunk_text: 'text', similarity: 0.7 },
                ],
                error: null,
            })

            const results = await service.searchSimilar('query', {
                noteIds: ['n1', 'n3'],
            })

            expect(results.length).toBe(2)
            expect(results.map(r => r.noteId)).toContain('n1')
            expect(results.map(r => r.noteId)).toContain('n3')
            expect(results.map(r => r.noteId)).not.toContain('n2')
        })
    })

    describe('chunkText (private method via indexNote)', () => {
        it('should not chunk short text', async () => {
            const shortText = 'This is a short note.'

            // We can test this indirectly through indexNote
            await service.indexNote('test-note-id', shortText, 'Test Title')

            // Should only call upsert once for short text
            expect(mockSupabase.from).toHaveBeenCalledWith('note_embeddings')
        })
    })

    describe('indexNote', () => {
        it('should index note with embeddings', async () => {
            await service.indexNote('test-note-id', 'Test content', 'Test Title')

            expect(mockSupabase.from).toHaveBeenCalledWith('note_embeddings')
            expect(mockSupabase.upsert).toHaveBeenCalled()
        })
    })

    describe('removeNoteEmbeddings', () => {
        it('should delete embeddings for note', async () => {
            await service.removeNoteEmbeddings('test-note-id')

            expect(mockSupabase.from).toHaveBeenCalledWith('note_embeddings')
            expect(mockSupabase.delete).toHaveBeenCalled()
            expect(mockSupabase.eq).toHaveBeenCalledWith('note_id', 'test-note-id')
        })
    })
})

describe('createEmbeddingService', () => {
    it('should create EmbeddingService instance', async () => {
        const { createEmbeddingService } = await import('../services/embedding')
        const mockSupabase = createMockSupabase()

        const service = createEmbeddingService({
            supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
            userId: 'test-user',
            openaiApiKey: 'test-key',
        })

        expect(service).toBeInstanceOf(EmbeddingService)
    })
})
