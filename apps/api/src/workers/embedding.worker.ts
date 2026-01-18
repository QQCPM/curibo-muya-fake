/**
 * Embedding Worker
 * 
 * Background worker that processes the embedding queue.
 * Polls for pending jobs, chunks content, generates embeddings,
 * and stores them in note_embeddings table.
 * 
 * Run with: npx tsx apps/api/src/workers/embedding.worker.ts
 */

import 'dotenv/config'
import { SupabaseClient, createClient } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export interface EmbeddingWorkerConfig {
    /** Supabase client with service_role key */
    supabase: SupabaseClient
    /** OpenAI API key for embeddings */
    openaiApiKey: string
    /** Poll interval in ms (default: 5000) */
    pollInterval?: number
    /** Batch size for processing (default: 10) */
    batchSize?: number
    /** Log function */
    log?: (message: string) => void
}

interface QueueJob {
    id: string
    user_id: string
    note_id: string | null
    attachment_id: string | null
    attempts: number
}

// ============================================================================
// Embedding Worker Class
// ============================================================================

export class EmbeddingWorker {
    private supabase: SupabaseClient
    private openaiApiKey: string
    private pollInterval: number
    private batchSize: number
    private running = false
    private timeoutId: ReturnType<typeof setTimeout> | null = null
    private log: (message: string) => void

    constructor(config: EmbeddingWorkerConfig) {
        this.supabase = config.supabase
        this.openaiApiKey = config.openaiApiKey
        this.pollInterval = config.pollInterval ?? 5000
        this.batchSize = config.batchSize ?? 10
        this.log = config.log ?? console.log
    }

    /**
     * Start the worker loop
     */
    async start(): Promise<void> {
        if (this.running) {
            this.log('Worker already running')
            return
        }

        this.running = true
        this.log(`Embedding worker started (poll: ${this.pollInterval}ms, batch: ${this.batchSize})`)

        // Process loop
        while (this.running) {
            try {
                const processedCount = await this.processBatch()
                if (processedCount > 0) {
                    this.log(`Processed ${processedCount} embedding jobs`)
                }
            } catch (err) {
                this.log(`Error in batch processing: ${err}`)
            }

            // Wait before next poll
            if (this.running) {
                await this.sleep(this.pollInterval)
            }
        }

        this.log('Embedding worker stopped')
    }

    /**
     * Stop the worker gracefully
     */
    async stop(): Promise<void> {
        this.log('Stopping embedding worker...')
        this.running = false

        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.timeoutId = null
        }
    }

    /**
     * Process a batch of jobs from the queue
     */
    private async processBatch(): Promise<number> {
        // Get batch of pending jobs using RPC
        const { data: jobs, error } = await this.supabase.rpc('get_embedding_queue_batch', {
            p_batch_size: this.batchSize,
        })

        if (error) {
            this.log(`Error fetching queue batch: ${error.message}`)
            return 0
        }

        if (!jobs || jobs.length === 0) {
            return 0
        }

        // Process each job
        let successCount = 0
        for (const job of jobs as QueueJob[]) {
            try {
                await this.processJob(job)
                successCount++
            } catch (err) {
                this.log(`Error processing job ${job.id}: ${err}`)
            }
        }

        return successCount
    }

    /**
     * Process a single embedding job
     */
    private async processJob(job: QueueJob): Promise<void> {
        try {
            // Only process note jobs for now (attachment support can be added later)
            if (!job.note_id) {
                throw new Error('Only note embeddings are supported currently')
            }

            // 1. Fetch note content
            const { data: note, error: noteError } = await this.supabase
                .from('notes')
                .select('title, content')
                .eq('id', job.note_id)
                .single()

            if (noteError || !note) {
                throw new Error(`Failed to fetch note: ${noteError?.message || 'Not found'}`)
            }

            const { title, content } = note as { title: string; content: string }

            if (!content || content.trim().length === 0) {
                // Skip empty notes but mark as complete
                await this.completeJob(job.id, true)
                return
            }

            // 2. Chunk content
            const { createChunkingService } = await import('@inkdown/ai/services')
            const chunker = createChunkingService({ maxTokens: 500, overlap: 50 })
            const chunks = await chunker.chunkText(content)

            // 3. Generate embeddings
            const { createEmbeddingService } = await import('@inkdown/ai/services')
            const embedder = createEmbeddingService({
                supabase: this.supabase,
                userId: job.user_id,
                openaiApiKey: this.openaiApiKey,
            })

            // Delete existing embeddings for this note
            await this.supabase
                .from('note_embeddings')
                .delete()
                .eq('note_id', job.note_id)

            // 4. Store embeddings for each chunk
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i]
                const embedding = await embedder.generateEmbedding(chunk.text)

                await this.supabase.from('note_embeddings').insert({
                    note_id: job.note_id,
                    user_id: job.user_id,
                    chunk_index: i,
                    chunk_text: chunk.text,
                    embedding,
                })
            }

            // 5. Mark job complete
            await this.completeJob(job.id, true)
            this.log(`Embedded note "${title}" (${chunks.length} chunks)`)

        } catch (err) {
            // Mark job as failed
            await this.completeJob(job.id, false, String(err))
            throw err
        }
    }

    /**
     * Mark job as complete or failed
     */
    private async completeJob(jobId: string, success: boolean, error?: string): Promise<void> {
        await this.supabase.rpc('complete_embedding_job', {
            p_job_id: jobId,
            p_success: success,
            p_error: error || null,
        })
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            this.timeoutId = setTimeout(resolve, ms)
        })
    }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main(): Promise<void> {
    // Load environment
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
        process.exit(1)
    }

    if (!openaiApiKey) {
        console.error('Missing OPENAI_API_KEY')
        process.exit(1)
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
    })

    // Create and start worker
    const worker = new EmbeddingWorker({
        supabase,
        openaiApiKey,
        pollInterval: parseInt(process.env.POLL_INTERVAL || '5000', 10),
        batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
        log: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`),
    })

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT, shutting down...')
        await worker.stop()
        process.exit(0)
    })

    process.on('SIGTERM', async () => {
        console.log('\nReceived SIGTERM, shutting down...')
        await worker.stop()
        process.exit(0)
    })

    // Start worker
    await worker.start()
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error('Fatal error:', err)
        process.exit(1)
    })
}

export { main as runEmbeddingWorker }
