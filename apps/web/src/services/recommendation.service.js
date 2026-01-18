/**
 * Recommendation Service (Frontend)
 *
 * Vue composable for generating and managing AI recommendations.
 * Provides reactive state for mindmaps, flashcards, concepts, and exercises.
 *
 * Phase 3.3 Implementation as per next_phases_plan.md
 */
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
// ============================================================================
// API Client
// ============================================================================
async function fetchWithAuth(endpoint, options = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const res = await fetch(`/api/recommend${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
}
// ============================================================================
// Vue Composable
// ============================================================================
export function useRecommendations(noteId) {
    // Loading states
    const loadingMindmap = ref(false);
    const loadingFlashcards = ref(false);
    const loadingConcepts = ref(false);
    const loadingExercises = ref(false);
    const loadingAll = ref(false);
    // Error state
    const error = ref(null);
    // Data
    const mindmap = ref(null);
    const flashcards = ref(null);
    const concepts = ref(null);
    const exercises = ref(null);
    // Computed
    const hasAnyData = computed(() => mindmap.value || flashcards.value || concepts.value || exercises.value);
    const isLoading = computed(() => loadingMindmap.value || loadingFlashcards.value ||
        loadingConcepts.value || loadingExercises.value || loadingAll.value);
    // ============================================================================
    // API Methods
    // ============================================================================
    async function generateMindmap() {
        if (!noteId.value)
            return null;
        loadingMindmap.value = true;
        error.value = null;
        try {
            const result = await fetchWithAuth('/mindmap', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            });
            mindmap.value = result;
            return result;
        }
        catch (err) {
            error.value = String(err);
            return null;
        }
        finally {
            loadingMindmap.value = false;
        }
    }
    async function generateFlashcards() {
        if (!noteId.value)
            return null;
        loadingFlashcards.value = true;
        error.value = null;
        try {
            const result = await fetchWithAuth('/flashcards', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            });
            flashcards.value = result;
            return result;
        }
        catch (err) {
            error.value = String(err);
            return null;
        }
        finally {
            loadingFlashcards.value = false;
        }
    }
    async function generateConcepts() {
        if (!noteId.value)
            return null;
        loadingConcepts.value = true;
        error.value = null;
        try {
            const result = await fetchWithAuth('/concepts', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            });
            concepts.value = result;
            return result;
        }
        catch (err) {
            error.value = String(err);
            return null;
        }
        finally {
            loadingConcepts.value = false;
        }
    }
    async function generateExercises() {
        if (!noteId.value)
            return null;
        loadingExercises.value = true;
        error.value = null;
        try {
            const result = await fetchWithAuth('/exercises', {
                method: 'POST',
                body: JSON.stringify({ noteId: noteId.value }),
            });
            exercises.value = result;
            return result;
        }
        catch (err) {
            error.value = String(err);
            return null;
        }
        finally {
            loadingExercises.value = false;
        }
    }
    async function generateAll() {
        if (!noteId.value)
            return;
        loadingAll.value = true;
        error.value = null;
        try {
            const result = await fetchWithAuth(`/${noteId.value}/all`);
            mindmap.value = result.mindmap;
            flashcards.value = result.flashcards;
            concepts.value = result.concepts;
            exercises.value = result.exercises;
        }
        catch (err) {
            error.value = String(err);
        }
        finally {
            loadingAll.value = false;
        }
    }
    function clearAll() {
        mindmap.value = null;
        flashcards.value = null;
        concepts.value = null;
        exercises.value = null;
        error.value = null;
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
    };
}
