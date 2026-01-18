/**
 * Chunking Service
 * 
 * Splits text content into semantic chunks for embedding.
 * Uses js-tiktoken for accurate token counting with GPT-4/embedding models.
 * 
 * Features:
 * - Sentence-boundary aware splitting
 * - Configurable chunk size and overlap
 * - Markdown-aware (preserves code blocks)
 * - Token counting with cl100k_base encoding
 */

// ============================================================================
// Types
// ============================================================================

export interface ChunkingOptions {
    /** Maximum tokens per chunk (default: 500) */
    maxTokens?: number
    /** Token overlap between chunks (default: 50) */
    overlap?: number
    /** Preserve markdown code blocks - don't split inside them (default: true) */
    preserveCodeBlocks?: boolean
}

export interface TextChunk {
    /** Zero-based index of the chunk */
    index: number
    /** The chunk text content */
    text: string
    /** Estimated token count */
    tokenCount: number
    /** Start character offset in original text */
    startOffset: number
    /** End character offset in original text */
    endOffset: number
}

// ============================================================================
// Tiktoken Lazy Loading
// ============================================================================

let encoderPromise: Promise<{ encode: (text: string) => number[] }> | null = null

async function getEncoder() {
    if (!encoderPromise) {
        encoderPromise = (async () => {
            try {
                const { getEncoding } = await import('js-tiktoken')
                return getEncoding('cl100k_base') // GPT-4 / text-embedding-3 encoding
            } catch {
                // Fallback: estimate 4 chars per token
                return {
                    encode: (text: string) => {
                        const length = Math.ceil(text.length / 4)
                        return new Array(length).fill(0)
                    }
                }
            }
        })()
    }
    return encoderPromise
}

// ============================================================================
// Chunking Service Class
// ============================================================================

export class ChunkingService {
    private options: Required<ChunkingOptions>

    constructor(options: ChunkingOptions = {}) {
        this.options = {
            maxTokens: options.maxTokens ?? 500,
            overlap: options.overlap ?? 50,
            preserveCodeBlocks: options.preserveCodeBlocks ?? true,
        }
    }

    /**
     * Count tokens in text
     */
    async countTokens(text: string): Promise<number> {
        const encoder = await getEncoder()
        return encoder.encode(text).length
    }

    /**
     * Estimate number of chunks for given text
     */
    async estimateChunks(text: string): Promise<number> {
        const tokenCount = await this.countTokens(text)
        if (tokenCount <= this.options.maxTokens) return 1
        return Math.ceil(tokenCount / (this.options.maxTokens - this.options.overlap))
    }

    /**
     * Split text into semantic chunks
     */
    async chunkText(content: string): Promise<TextChunk[]> {
        if (!content || content.trim().length === 0) {
            return []
        }

        const tokenCount = await this.countTokens(content)

        // If content fits in one chunk, return as-is
        if (tokenCount <= this.options.maxTokens) {
            return [{
                index: 0,
                text: content,
                tokenCount,
                startOffset: 0,
                endOffset: content.length,
            }]
        }

        // Split into segments
        const segments = this.splitIntoSegments(content)
        const chunks: TextChunk[] = []

        let currentChunk = ''
        let currentTokens = 0
        let chunkStart = 0
        let currentOffset = 0

        for (const segment of segments) {
            const segmentTokens = await this.countTokens(segment.text)

            // If adding this segment would exceed max, start new chunk
            if (currentTokens + segmentTokens > this.options.maxTokens && currentChunk.length > 0) {
                chunks.push({
                    index: chunks.length,
                    text: currentChunk.trim(),
                    tokenCount: currentTokens,
                    startOffset: chunkStart,
                    endOffset: currentOffset,
                })

                // Calculate overlap start
                const overlapText = this.getOverlapText(currentChunk, this.options.overlap)
                currentChunk = overlapText
                currentTokens = await this.countTokens(overlapText)
                chunkStart = currentOffset - overlapText.length
            }

            currentChunk += segment.text
            currentTokens += segmentTokens
            currentOffset += segment.text.length
        }

        // Add final chunk
        if (currentChunk.trim().length > 0) {
            chunks.push({
                index: chunks.length,
                text: currentChunk.trim(),
                tokenCount: currentTokens,
                startOffset: chunkStart,
                endOffset: currentOffset,
            })
        }

        return chunks
    }

    /**
     * Split content into semantic segments (sentences, paragraphs, code blocks)
     */
    private splitIntoSegments(content: string): Array<{ text: string; type: 'text' | 'code' }> {
        const segments: Array<{ text: string; type: 'text' | 'code' }> = []

        if (this.options.preserveCodeBlocks) {
            // Split around code blocks first
            const codeBlockRegex = /```[\s\S]*?```/g
            let lastIndex = 0
            let match

            while ((match = codeBlockRegex.exec(content)) !== null) {
                // Text before code block
                if (match.index > lastIndex) {
                    const textBefore = content.slice(lastIndex, match.index)
                    segments.push(...this.splitTextIntoSentences(textBefore))
                }

                // Code block as single segment (don't split)
                segments.push({ text: match[0], type: 'code' })
                lastIndex = match.index + match[0].length
            }

            // Text after last code block
            if (lastIndex < content.length) {
                segments.push(...this.splitTextIntoSentences(content.slice(lastIndex)))
            }
        } else {
            segments.push(...this.splitTextIntoSentences(content))
        }

        return segments
    }

    /**
     * Split text into sentence segments
     */
    private splitTextIntoSentences(text: string): Array<{ text: string; type: 'text' }> {
        const segments: Array<{ text: string; type: 'text' }> = []

        // Split on sentence boundaries and paragraph breaks
        // Regex matches: period/question/exclamation + space, or double newline
        const parts = text.split(/(?<=[.!?])\s+|(?:\n\n+)/)

        for (const part of parts) {
            if (part.trim().length > 0) {
                // Add back spacing for natural text flow
                segments.push({ text: part + ' ', type: 'text' })
            }
        }

        return segments
    }

    /**
     * Get overlap text from end of chunk
     */
    private getOverlapText(text: string, targetTokens: number): string {
        // Estimate characters from tokens (rough: 4 chars per token)
        const estimatedChars = targetTokens * 4

        if (text.length <= estimatedChars) {
            return text
        }

        // Find sentence boundary near target
        const searchStart = Math.max(0, text.length - estimatedChars * 1.5)
        const endPortion = text.slice(searchStart)

        // Find first sentence start in the overlap region
        const sentenceStart = endPortion.search(/(?<=[.!?])\s+/)

        if (sentenceStart > 0) {
            return endPortion.slice(sentenceStart).trim() + ' '
        }

        // Fallback: just take last N characters
        return text.slice(-estimatedChars)
    }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createChunkingService(options?: ChunkingOptions): ChunkingService {
    return new ChunkingService(options)
}

// ============================================================================
// Standalone Helpers
// ============================================================================

/**
 * Quick token count without service instantiation
 */
export async function countTokens(text: string): Promise<number> {
    const encoder = await getEncoder()
    return encoder.encode(text).length
}

/**
 * Quick chunk without service instantiation
 */
export async function chunkText(
    content: string,
    options?: ChunkingOptions
): Promise<TextChunk[]> {
    const service = createChunkingService(options)
    return service.chunkText(content)
}
