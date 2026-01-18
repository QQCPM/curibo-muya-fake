/**
 * Recommendation Service
 * 
 * Generates AI-powered study aids from note content:
 * - Mindmaps for visual learning
 * - Flashcards for memorization
 * - Concept breakdowns
 * - Practice exercises
 * - External resources
 * 
 * Phase 3.1 Implementation as per next_phases_plan.md
 */

import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// ============================================================================
// Types
// ============================================================================

export interface MindmapNode {
    id: string
    label: string
    type: 'root' | 'branch' | 'leaf'
    color?: string
    parentId?: string
}

export interface MindmapEdge {
    id: string
    source: string
    target: string
}

export interface Mindmap {
    id: string
    noteId: string
    title: string
    nodes: MindmapNode[]
    edges: MindmapEdge[]
    createdAt: string
}

export interface Flashcard {
    id: string
    front: string
    back: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
}

export interface FlashcardDeck {
    id: string
    noteId: string
    title: string
    cards: Flashcard[]
    createdAt: string
}

export interface Concept {
    id: string
    name: string
    definition: string
    examples: string[]
    relatedConcepts: string[]
}

export interface ConceptTree {
    id: string
    noteId: string
    title: string
    concepts: Concept[]
    createdAt: string
}

export interface Exercise {
    id: string
    question: string
    type: 'multiple_choice' | 'short_answer' | 'true_false' | 'fill_blank'
    options?: string[]
    answer: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
}

export interface ExerciseSet {
    id: string
    noteId: string
    title: string
    exercises: Exercise[]
    createdAt: string
}

export interface Resource {
    id: string
    title: string
    url: string
    type: 'article' | 'video' | 'course' | 'book' | 'tool'
    description: string
}

export interface RecommendationServiceConfig {
    openaiApiKey: string
}

// ============================================================================
// Simple Cache (5-minute TTL)
// ============================================================================

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
        cache.delete(key)
        return null
    }
    return entry.data
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
    })
}

// ============================================================================
// Recommendation Service Class
// ============================================================================

export class RecommendationService {
    private openai: ReturnType<typeof createOpenAI>

    constructor(config: RecommendationServiceConfig) {
        this.openai = createOpenAI({ apiKey: config.openaiApiKey })
    }

    /**
     * Generate a mindmap from note content
     */
    async generateMindmap(noteId: string, content: string, title: string): Promise<Mindmap> {
        const cacheKey = `mindmap:${noteId}`
        const cached = getCached<Mindmap>(cacheKey)
        if (cached) return cached

        const prompt = `Analyze this note and create a mindmap structure.

Note Title: "${title}"
Content:
${content.slice(0, 6000)}

Create a hierarchical mindmap with:
1. One root node (the main topic)
2. 3-6 branch nodes (key concepts)
3. 2-4 leaf nodes per branch (specific details)

Respond with valid JSON only:
{
  "title": "Main Topic",
  "nodes": [
    {"id": "root", "label": "Main Topic", "type": "root"},
    {"id": "branch1", "label": "Key Concept", "type": "branch", "parentId": "root"},
    {"id": "leaf1", "label": "Detail", "type": "leaf", "parentId": "branch1"}
  ]
}

Output JSON only, no markdown.`

        try {
            const result = await generateText({
                model: this.openai('gpt-5.2'),
                messages: [{ role: 'user', content: prompt }],
            })

            const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

            const nodes: MindmapNode[] = parsed.nodes.map((n: MindmapNode) => ({
                id: n.id,
                label: n.label,
                type: n.type,
                parentId: n.parentId,
                color: n.type === 'root' ? '#6366f1' : n.type === 'branch' ? '#8b5cf6' : '#a78bfa',
            }))

            const edges: MindmapEdge[] = nodes
                .filter(n => n.parentId)
                .map(n => ({
                    id: `edge-${n.parentId}-${n.id}`,
                    source: n.parentId!,
                    target: n.id,
                }))

            const mindmap: Mindmap = {
                id: crypto.randomUUID(),
                noteId,
                title: parsed.title || title,
                nodes,
                edges,
                createdAt: new Date().toISOString(),
            }

            setCache(cacheKey, mindmap)
            return mindmap
        } catch (err) {
            // Return a minimal mindmap on error
            return {
                id: crypto.randomUUID(),
                noteId,
                title,
                nodes: [{ id: 'root', label: title, type: 'root', color: '#6366f1' }],
                edges: [],
                createdAt: new Date().toISOString(),
            }
        }
    }

    /**
     * Generate flashcards from note content
     */
    async generateFlashcards(noteId: string, content: string, title: string): Promise<FlashcardDeck> {
        const cacheKey = `flashcards:${noteId}`
        const cached = getCached<FlashcardDeck>(cacheKey)
        if (cached) return cached

        const prompt = `Create flashcards from this note for effective studying.

Note Title: "${title}"
Content:
${content.slice(0, 6000)}

Generate 8-12 flashcards covering key concepts. Each card should:
1. Have a clear question on the front
2. Have a concise answer on the back
3. Be categorized by difficulty

Respond with valid JSON only:
{
  "cards": [
    {
      "front": "What is X?",
      "back": "X is...",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Output JSON only, no markdown.`

        try {
            const result = await generateText({
                model: this.openai('gpt-5.2'),
                messages: [{ role: 'user', content: prompt }],
            })

            const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

            const cards: Flashcard[] = (parsed.cards || []).map((c: Flashcard, i: number) => ({
                id: crypto.randomUUID(),
                front: c.front,
                back: c.back,
                difficulty: c.difficulty || 'medium',
                tags: c.tags || [],
            }))

            const deck: FlashcardDeck = {
                id: crypto.randomUUID(),
                noteId,
                title: `Flashcards: ${title}`,
                cards,
                createdAt: new Date().toISOString(),
            }

            setCache(cacheKey, deck)
            return deck
        } catch {
            return {
                id: crypto.randomUUID(),
                noteId,
                title: `Flashcards: ${title}`,
                cards: [],
                createdAt: new Date().toISOString(),
            }
        }
    }

    /**
     * Generate concept breakdown from note content
     */
    async generateConcepts(noteId: string, content: string, title: string): Promise<ConceptTree> {
        const cacheKey = `concepts:${noteId}`
        const cached = getCached<ConceptTree>(cacheKey)
        if (cached) return cached

        const prompt = `Extract and explain the key concepts from this note.

Note Title: "${title}"
Content:
${content.slice(0, 6000)}

Identify 5-8 key concepts and for each provide:
1. A clear definition
2. 1-2 examples
3. Related concepts

Respond with valid JSON only:
{
  "concepts": [
    {
      "name": "Concept Name",
      "definition": "Clear definition...",
      "examples": ["Example 1", "Example 2"],
      "relatedConcepts": ["Related 1", "Related 2"]
    }
  ]
}

Output JSON only.`

        try {
            const result = await generateText({
                model: this.openai('gpt-5.2'),
                messages: [{ role: 'user', content: prompt }],
            })

            const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

            const concepts: Concept[] = (parsed.concepts || []).map((c: Concept) => ({
                id: crypto.randomUUID(),
                name: c.name,
                definition: c.definition,
                examples: c.examples || [],
                relatedConcepts: c.relatedConcepts || [],
            }))

            const tree: ConceptTree = {
                id: crypto.randomUUID(),
                noteId,
                title: `Concepts: ${title}`,
                concepts,
                createdAt: new Date().toISOString(),
            }

            setCache(cacheKey, tree)
            return tree
        } catch {
            return {
                id: crypto.randomUUID(),
                noteId,
                title: `Concepts: ${title}`,
                concepts: [],
                createdAt: new Date().toISOString(),
            }
        }
    }

    /**
     * Generate practice exercises from note content
     */
    async generateExercises(noteId: string, content: string, title: string): Promise<ExerciseSet> {
        const cacheKey = `exercises:${noteId}`
        const cached = getCached<ExerciseSet>(cacheKey)
        if (cached) return cached

        const prompt = `Create practice exercises to test understanding of this note.

Note Title: "${title}"
Content:
${content.slice(0, 6000)}

Generate 6-10 exercises of varying types and difficulties:
1. Multiple choice (4 options)
2. True/False
3. Short answer
4. Fill in the blank

Respond with valid JSON only:
{
  "exercises": [
    {
      "question": "Question text",
      "type": "multiple_choice|true_false|short_answer|fill_blank",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer",
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Output JSON only.`

        try {
            const result = await generateText({
                model: this.openai('gpt-5.2'),
                messages: [{ role: 'user', content: prompt }],
            })

            const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

            const exercises: Exercise[] = (parsed.exercises || []).map((e: Exercise) => ({
                id: crypto.randomUUID(),
                question: e.question,
                type: e.type || 'short_answer',
                options: e.options,
                answer: e.answer,
                explanation: e.explanation || '',
                difficulty: e.difficulty || 'medium',
            }))

            const set: ExerciseSet = {
                id: crypto.randomUUID(),
                noteId,
                title: `Exercises: ${title}`,
                exercises,
                createdAt: new Date().toISOString(),
            }

            setCache(cacheKey, set)
            return set
        } catch {
            return {
                id: crypto.randomUUID(),
                noteId,
                title: `Exercises: ${title}`,
                exercises: [],
                createdAt: new Date().toISOString(),
            }
        }
    }

    /**
     * Generate all recommendations for a note
     */
    async generateAll(noteId: string, content: string, title: string): Promise<{
        mindmap: Mindmap
        flashcards: FlashcardDeck
        concepts: ConceptTree
        exercises: ExerciseSet
    }> {
        // Generate all in parallel
        const [mindmap, flashcards, concepts, exercises] = await Promise.all([
            this.generateMindmap(noteId, content, title),
            this.generateFlashcards(noteId, content, title),
            this.generateConcepts(noteId, content, title),
            this.generateExercises(noteId, content, title),
        ])

        return { mindmap, flashcards, concepts, exercises }
    }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createRecommendationService(config: RecommendationServiceConfig): RecommendationService {
    return new RecommendationService(config)
}
