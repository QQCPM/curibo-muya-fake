/**
 * AI Services exports
 *
 * This module provides services for embedding, RAG, and chunking.
 */

// Embedding and RAG Service
export {
  EmbeddingService,
  createEmbeddingService,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  type EmbeddingServiceConfig,
  type RAGChunk,
  type RAGOptions,
} from './embedding'

// Chunking Service
export {
  ChunkingService,
  createChunkingService,
  countTokens,
  chunkText,
  type ChunkingOptions,
  type TextChunk,
} from './chunking'

// Recommendation Service
export {
  RecommendationService,
  createRecommendationService,
  type Mindmap,
  type MindmapNode,
  type MindmapEdge,
  type Flashcard,
  type FlashcardDeck,
  type Concept,
  type ConceptTree,
  type Exercise,
  type ExerciseSet,
  type RecommendationServiceConfig,
} from './recommendations'

/**
 * Embedding result from the embedding service
 */
export interface EmbeddingResult {
  embedding: number[]
  model: string
  tokenCount: number
  dimensions: number
}

// TextChunk and ChunkingOptions are now exported from './chunking'

/**
 * RAG retrieval result (legacy, use RAGChunk from embedding.ts)
 */
export interface RAGResult {
  noteId: string
  title: string
  chunkText: string
  similarity: number
  metadata?: Record<string, unknown>
}

// RAGOptions is now exported from './embedding'

/**
 * Default chunking configuration
 */
import type { ChunkingOptions as ChunkingOptionsType } from './chunking'
export const DEFAULT_CHUNKING_OPTIONS: Required<ChunkingOptionsType> = {
  maxTokens: 500,
  overlap: 50,
  preserveCodeBlocks: true,
}

/**
 * Default RAG configuration
 */
import type { RAGOptions as RAGOptionsType } from './embedding'
export const DEFAULT_RAG_OPTIONS: Required<RAGOptionsType> = {
  limit: 5,
  threshold: 0.7,
  projectId: undefined as unknown as string,
  noteIds: [],
}

/**
 * Embedding model configurations
 */
export const EMBEDDING_MODELS = {
  'text-embedding-3-large': {
    provider: 'openai',
    dimensions: 3072, // Can be reduced to 1536
    maxInput: 8191,
  },
  'text-embedding-3-small': {
    provider: 'openai',
    dimensions: 1536,
    maxInput: 8191,
  },
} as const

export type EmbeddingModel = keyof typeof EMBEDDING_MODELS
