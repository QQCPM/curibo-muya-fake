/**
 * Recommendation Service (Frontend)
 * 
 * Vue composable for generating and managing AI recommendations.
 * Provides reactive state for mindmaps, flashcards, concepts, and exercises.
 * 
 * Phase 3.3 Implementation as per next_phases_plan.md
 */

import { ref, computed, type Ref } from 'vue'
import { supabase } from '@/services/supabase'

// ============================================================================
// Types (matching backend)
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

// ============================================================================
// API Client
// ============================================================================

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    const res = await fetch(`/api/recommend${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(error.error || 'Request failed')
    }

    return res.json()
}

// ============================================================================
// Vue Composable
// ============================================================================

export function useRecommendations(noteId: Ref<string | null>) {
    // Loading states
    const loadingMindmap = ref(false)
    const loadingFlashcards = ref(false)
    const loadingConcepts = ref(false)
    const loadingExercises = ref(false)
    const loadingAll = ref(false)

    // Error state
    const error = ref<string | null>(null)

    // Data
    const mindmap = ref<Mindmap | null>(null)
    const flashcards = ref<FlashcardDeck | null>(null)
    const concepts = ref<ConceptTree | null>(null)
    const exercises = ref<ExerciseSet | null>(null)

    // Computed
    const hasAnyData = computed(() =>
        mindmap.value || flashcards.value || concepts.value || exercises.value
    )

    const isLoading = computed(() =>
        loadingMindmap.value || loadingFlashcards.value ||
        loadingConcepts.value || loadingExercises.value || loadingAll.value
    )

    // ============================================================================
    // API Methods
    // ============================================================================

    async function generateMindmap(): Promise<Mindmap | null> {
        if (!noteId.value) return null

        loadingMindmap.value = true
        error.value = null

        try {
            const result = await fetchWithAuth('/mindmap', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            })
            mindmap.value = result
            return result
        } catch (err) {
            error.value = String(err)
            return null
        } finally {
            loadingMindmap.value = false
        }
    }

    async function generateFlashcards(): Promise<FlashcardDeck | null> {
        if (!noteId.value) return null

        loadingFlashcards.value = true
        error.value = null

        try {
            const result = await fetchWithAuth('/flashcards', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            })
            flashcards.value = result
            return result
        } catch (err) {
            error.value = String(err)
            return null
        } finally {
            loadingFlashcards.value = false
        }
    }

    async function generateConcepts(): Promise<ConceptTree | null> {
        if (!noteId.value) return null

        loadingConcepts.value = true
        error.value = null

        try {
            const result = await fetchWithAuth('/concepts', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            })
            concepts.value = result
            return result
        } catch (err) {
            error.value = String(err)
            return null
        } finally {
            loadingConcepts.value = false
        }
    }

    async function generateExercises(): Promise<ExerciseSet | null> {
        if (!noteId.value) return null

        loadingExercises.value = true
        error.value = null

        try {
            const result = await fetchWithAuth('/exercises', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            })
            exercises.value = result
            return result
        } catch (err) {
            error.value = String(err)
            return null
        } finally {
            loadingExercises.value = false
        }
    }

    async function generateAll(): Promise<void> {
        if (!noteId.value) return

        loadingAll.value = true
        error.value = null

        try {
            const result = await fetchWithAuth(`/${noteId.value}/all`)
            mindmap.value = result.mindmap
            flashcards.value = result.flashcards
            concepts.value = result.concepts
            exercises.value = result.exercises
        } catch (err) {
            error.value = String(err)
        } finally {
            loadingAll.value = false
        }
    }

    function clearAll(): void {
        mindmap.value = null
        flashcards.value = null
        concepts.value = null
        exercises.value = null
        error.value = null
    }

    return {
        // Loading states
        loadingMindmap,
        loadingFlashcards,
        loadingConcepts,
        loadingExercises,
        loadingAll,
        isLoading,

        // Error
        error,

        // Data
        mindmap,
        flashcards,
        concepts,
        exercises,
        hasAnyData,

        // Methods
        generateMindmap,
        generateFlashcards,
        generateConcepts,
        generateExercises,
        generateAll,
        clearAll,
    }
}

// Export types for components
export type UseRecommendationsReturn = ReturnType<typeof useRecommendations>
