/**
 * Vercel AI SDK Integration
 * 
 * This module provides a simplified, modern API for AI agents using
 * Vercel AI SDK 6. It wraps all 26 tools and 4 agents in a clean interface.
 * 
 * Usage:
 * ```typescript
 * import { runSecretary, streamSecretary, createVercelTools } from '@inkdown/ai/vercel'
 * 
 * // Run secretary agent
 * const result = await runSecretary({ message: 'Hello' }, config)
 * 
 * // Stream secretary response
 * const stream = await streamSecretary({ message: 'Help me plan' }, config)
 * for await (const chunk of stream.textStream) {
 *   console.log(chunk)
 * }
 * ```
 * 
 * Models used (from Note3):
 * - GPT-5.2: All agents (chat, secretary, note, planner)
 * - text-embedding-3-large: Embeddings (1536 dims)
 * - GLM-4.6: Artifacts/code (via separate provider)
 * - Gemini 3 Pro: Slides/research (via separate provider)
 */

// ============================================================================
// Tools
// ============================================================================

export {
    // Factory functions
    createVercelTools,
    getSecretaryTools,
    getCoreTools,
    getNoteTools,
    getDatabaseTools,
    getArtifactTools,
    // Types
    type VercelToolContext,
    type VercelTools,
    type SecretaryTools,
    type CoreTools,
} from './tools'

// ============================================================================
// Agents
// ============================================================================

export {
    // Secretary Agent
    runSecretary,
    streamSecretary,
    type SecretaryInput,
    type SecretaryResult,

    // Chat Agent
    runChat,
    streamChat,
    type ChatInput,
    type ChatResult,

    // Note Agent
    runNote,
    streamNote,
    type NoteInput,
    type NoteResult,

    // Planner Agent
    createPlan,
    streamPlan,
    type PlannerInput,
    type PlannerResult,
    type Plan,
    type PlanStep,

    // Config
    type AgentConfig,
} from './agents'

// ============================================================================
// Re-exports from Vercel AI SDK for convenience
// ============================================================================

export { generateText, streamText, tool, type CoreMessage } from 'ai'
export { createOpenAI } from '@ai-sdk/openai'
