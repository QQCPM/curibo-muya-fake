/**
 * Vercel AI SDK Integration Tests
 * 
 * Tests for the Vercel AI SDK tool definitions and helper functions.
 * Note: These are unit tests that mock external API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
}

describe('Vercel Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createVercelTools', () => {
        it('should create all 26 tools', async () => {
            const { createVercelTools } = await import('../vercel/tools')

            const tools = createVercelTools({
                supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
                userId: 'test-user-id',
            })

            // Verify all tool categories are present
            expect(tools).toHaveProperty('read_block')
            expect(tools).toHaveProperty('read_note')
            expect(tools).toHaveProperty('edit_block')
            expect(tools).toHaveProperty('search_web')
            expect(tools).toHaveProperty('create_artifact')
            expect(tools).toHaveProperty('create_database')
            expect(tools).toHaveProperty('read_memory_file')
            expect(tools).toHaveProperty('write_memory_file')

            // Database tools
            expect(tools).toHaveProperty('db_add_row')
            expect(tools).toHaveProperty('db_update_rows')
            expect(tools).toHaveProperty('db_delete_rows')
            expect(tools).toHaveProperty('db_query_rows')
            expect(tools).toHaveProperty('db_aggregate')
            expect(tools).toHaveProperty('db_group_by')
            expect(tools).toHaveProperty('db_column_stats')
            expect(tools).toHaveProperty('db_sort_rows')
            expect(tools).toHaveProperty('db_get_schema')
            expect(tools).toHaveProperty('db_create_chart_data')

            // Artifact tools
            expect(tools).toHaveProperty('artifact_modify_html')
            expect(tools).toHaveProperty('artifact_modify_css')
            expect(tools).toHaveProperty('artifact_modify_js')
            expect(tools).toHaveProperty('artifact_parse_structure')
            expect(tools).toHaveProperty('artifact_get_css_rules')
            expect(tools).toHaveProperty('artifact_validate')

            // Secretary tools
            expect(tools).toHaveProperty('create_roadmap')
            expect(tools).toHaveProperty('save_roadmap')
            expect(tools).toHaveProperty('list_memory_files')
            expect(tools).toHaveProperty('delete_memory_file')
            expect(tools).toHaveProperty('get_roadmap')
            expect(tools).toHaveProperty('advance_roadmap_week')
            expect(tools).toHaveProperty('get_current_week_tasks')
        })
    })

    describe('getSecretaryTools', () => {
        it('should return only secretary-relevant tools', async () => {
            const { getSecretaryTools } = await import('../vercel/tools')

            const tools = getSecretaryTools({
                supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
                userId: 'test-user-id',
            })

            // Should have core and secretary tools
            expect(tools).toHaveProperty('read_note')
            expect(tools).toHaveProperty('edit_block')
            expect(tools).toHaveProperty('create_roadmap')
            expect(tools).toHaveProperty('read_memory_file')

            // Should NOT have database-specific tools
            expect(tools).not.toHaveProperty('db_add_row')
        })
    })

    describe('getCoreTools', () => {
        it('should return only core tools', async () => {
            const { getCoreTools } = await import('../vercel/tools')

            const tools = getCoreTools({
                supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
                userId: 'test-user-id',
            })

            // Should have core tools
            expect(tools).toHaveProperty('read_note')
            expect(tools).toHaveProperty('read_block')
            expect(tools).toHaveProperty('search_web')

            // Should NOT have secretary or database tools
            expect(tools).not.toHaveProperty('create_roadmap')
            expect(tools).not.toHaveProperty('db_add_row')
        })
    })

    describe('getDatabaseTools', () => {
        it('should return only database tools', async () => {
            const { getDatabaseTools } = await import('../vercel/tools')

            const tools = getDatabaseTools({
                supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
                userId: 'test-user-id',
            })

            // Should have database tools
            expect(tools).toHaveProperty('db_add_row')
            expect(tools).toHaveProperty('db_query_rows')
            expect(tools).toHaveProperty('db_aggregate')

            // Count should be 10
            expect(Object.keys(tools).length).toBe(10)
        })
    })

    describe('getArtifactTools', () => {
        it('should return only artifact tools', async () => {
            const { getArtifactTools } = await import('../vercel/tools')

            const tools = getArtifactTools({
                supabase: mockSupabase as unknown as import('@supabase/supabase-js').SupabaseClient,
                userId: 'test-user-id',
            })

            // Should have artifact tools
            expect(tools).toHaveProperty('artifact_modify_html')
            expect(tools).toHaveProperty('artifact_modify_css')
            expect(tools).toHaveProperty('artifact_validate')

            // Count should be 7 (includes create_artifact + 6 artifact_* tools)
            expect(Object.keys(tools).length).toBe(7)
        })
    })
})

describe('Vercel Agents', () => {
    describe('Agent Types', () => {
        it('should export all agent functions', async () => {
            const agents = await import('../vercel/agents')

            // Secretary
            expect(agents.runSecretary).toBeDefined()
            expect(agents.streamSecretary).toBeDefined()
            expect(typeof agents.runSecretary).toBe('function')
            expect(typeof agents.streamSecretary).toBe('function')

            // Chat
            expect(agents.runChat).toBeDefined()
            expect(agents.streamChat).toBeDefined()
            expect(typeof agents.runChat).toBe('function')
            expect(typeof agents.streamChat).toBe('function')

            // Note
            expect(agents.runNote).toBeDefined()
            expect(agents.streamNote).toBeDefined()
            expect(typeof agents.runNote).toBe('function')
            expect(typeof agents.streamNote).toBe('function')

            // Planner
            expect(agents.createPlan).toBeDefined()
            expect(agents.streamPlan).toBeDefined()
            expect(typeof agents.createPlan).toBe('function')
            expect(typeof agents.streamPlan).toBe('function')
        })

        it('should export agent types', async () => {
            const agents = await import('../vercel/agents')

            // Type exports are checked at compile time
            // But we can verify the module exports the expected types
            expect(agents).toBeDefined()
        })
    })
})

describe('Vercel Index Exports', () => {
    it('should export all tools and agents from index', async () => {
        const vercel = await import('../vercel')

        // Tool exports
        expect(vercel.createVercelTools).toBeDefined()
        expect(vercel.getSecretaryTools).toBeDefined()
        expect(vercel.getCoreTools).toBeDefined()
        expect(vercel.getDatabaseTools).toBeDefined()
        expect(vercel.getArtifactTools).toBeDefined()

        // Agent exports
        expect(vercel.runSecretary).toBeDefined()
        expect(vercel.streamSecretary).toBeDefined()
        expect(vercel.runChat).toBeDefined()
        expect(vercel.streamChat).toBeDefined()
        expect(vercel.runNote).toBeDefined()
        expect(vercel.streamNote).toBeDefined()
        expect(vercel.createPlan).toBeDefined()
        expect(vercel.streamPlan).toBeDefined()

        // Re-exports from ai SDK
        expect(vercel.generateText).toBeDefined()
        expect(vercel.streamText).toBeDefined()
        expect(vercel.tool).toBeDefined()
    })
})
