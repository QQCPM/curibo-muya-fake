/**
 * Embedding and RAG Service
 * 
 * Provides embedding generation and semantic search functionality
 * using OpenAI's text-embedding-3-large model (1536 dimensions).
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// Configuration
// ============================================================================

export const EMBEDDING_MODEL = 'text-embedding-3-large'
export const EMBEDDING_DIMENSIONS = 1536 // Reduced from 3072 for pgvector

export interface EmbeddingServiceConfig {
    supabase: SupabaseClient
    userId: string
    openaiApiKey: string
}

export interface RAGChunk {
    noteId: string
    noteTitle: string
    chunkText: string
    similarity: number
    metadata?: Record<string, unknown>
}

export interface RAGOptions {
    limit?: number
    threshold?: number
    projectId?: string
    noteIds?: string[]
}

// ============================================================================
// Embedding Service Class
// ============================================================================

export class EmbeddingService {
    private supabase: SupabaseClient
    private userId: string
    private openaiApiKey: string

    constructor(config: EmbeddingServiceConfig) {
        this.supabase = config.supabase
        this.userId = config.userId
        this.openaiApiKey = config.openaiApiKey
    }

    /**
     * Generate embedding for a text string
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const OpenAI = (await import('openai')).default
        const client = new OpenAI({ apiKey: this.openaiApiKey })

        const response = await client.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            dimensions: EMBEDDING_DIMENSIONS,
        })

        return response.data[0].embedding
    }

    /**
     * Generate embeddings for multiple texts (batch)
     */
    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) return []

        const OpenAI = (await import('openai')).default
        const client = new OpenAI({ apiKey: this.openaiApiKey })

        const response = await client.embeddings.create({
            model: EMBEDDING_MODEL,
            input: texts,
            dimensions: EMBEDDING_DIMENSIONS,
        })

        return response.data.map(d => d.embedding)
    }

    /**
     * Search for similar chunks using vector similarity
     */
    async searchSimilar(
        query: string,
        options: RAGOptions = {}
    ): Promise<RAGChunk[]> {
        const {
            limit = 5,
            threshold = 0.7,
            projectId,
            noteIds,
        } = options

        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query)

        // Build search query
        let searchQuery = this.supabase.rpc('search_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit,
            p_user_id: this.userId,
        })

        // Execute search
        const { data, error } = await searchQuery

        if (error) {
            console.error('RAG search error:', error)
            return []
        }

        // Map results
        let results: RAGChunk[] = (data || []).map((row: {
            note_id: string
            note_title: string
            chunk_text: string
            similarity: number
            project_id?: string
        }) => ({
            noteId: row.note_id,
            noteTitle: row.note_title,
            chunkText: row.chunk_text,
            similarity: row.similarity,
            metadata: { projectId: row.project_id },
        }))

        // Filter by project or specific notes if provided
        if (projectId) {
            results = results.filter(r =>
                (r.metadata as { projectId?: string })?.projectId === projectId
            )
        }
        if (noteIds && noteIds.length > 0) {
            results = results.filter(r => noteIds.includes(r.noteId))
        }

        return results
    }

    /**
     * Index a note's content by generating chunks and embeddings
     */
    async indexNote(noteId: string, content: string, title: string): Promise<void> {
        const chunks = this.chunkText(content)

        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i]
            const embedding = await this.generateEmbedding(chunkText)

            await this.supabase.from('note_embeddings').upsert({
                note_id: noteId,
                chunk_index: i,
                chunk_text: chunkText,
                embedding,
                user_id: this.userId,
            }, {
                onConflict: 'note_id,chunk_index',
            })
        }
    }

    /**
     * Remove embeddings for a note
     */
    async removeNoteEmbeddings(noteId: string): Promise<void> {
        await this.supabase
            .from('note_embeddings')
            .delete()
            .eq('note_id', noteId)
            .eq('user_id', this.userId)
    }

    /**
     * Chunk text into smaller pieces for embedding
     */
    private chunkText(text: string, maxChars = 1500, overlap = 200): string[] {
        if (!text || text.length <= maxChars) {
            return text ? [text] : []
        }

        const chunks: string[] = []
        let start = 0

        while (start < text.length) {
            let end = start + maxChars

            // Try to break at sentence boundary
            if (end < text.length) {
                const lastPeriod = text.lastIndexOf('.', end)
                const lastNewline = text.lastIndexOf('\n', end)
                const breakPoint = Math.max(lastPeriod, lastNewline)

                if (breakPoint > start + maxChars / 2) {
                    end = breakPoint + 1
                }
            }

            chunks.push(text.slice(start, end).trim())
            start = end - overlap

            if (start >= text.length) break
        }

        return chunks.filter(c => c.length > 0)
    }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createEmbeddingService(config: EmbeddingServiceConfig): EmbeddingService {
    return new EmbeddingService(config)
}
