/**
 * Vercel AI SDK Tool Definitions
 * 
 * Converts all 26 tools to Vercel AI SDK's tool() format for use with
 * generateText() and streamText(). Uses GPT-5.2 (OpenAI) for all agent operations.
 * 
 * Tool Categories:
 * - Core Editing (8)
 * - Database (10)
 * - Artifact (6)
 * - Secretary (7)
 */

import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'

// Import existing tool implementations
import {
    readBlock,
    readNote,
    editBlock,
    searchWeb,
    createArtifact,
    createDatabase,
    readMemory,
    writeMemory,
    ReadBlockSchema,
    ReadNoteSchema,
    EditBlockSchema,
    SearchWebSchema,
    CreateArtifactSchema,
    CreateDatabaseSchema,
    ReadMemorySchema,
    WriteMemorySchema,
} from '../tools/core.tools'

import {
    dbAddRow,
    dbUpdateRows,
    dbDeleteRows,
    dbQueryRows,
    dbAggregate,
    dbGroupBy,
    dbColumnStats,
    dbSortRows,
    dbGetSchema,
    dbCreateChartData,
    DbAddRowSchema,
    DbUpdateRowsSchema,
    DbDeleteRowsSchema,
    DbQueryRowsSchema,
    DbAggregateSchema,
    DbGroupBySchema,
    DbColumnStatsSchema,
    DbSortRowsSchema,
    DbGetSchemaSchema,
    DbCreateChartDataSchema,
} from '../tools/database.tools'

import {
    artifactModifyHtml,
    artifactModifyCss,
    artifactModifyJs,
    artifactParseStructure,
    artifactGetCssRules,
    artifactValidate,
    ArtifactModifyHtmlSchema,
    ArtifactModifyCssSchema,
    ArtifactModifyJsSchema,
    ArtifactParseStructureSchema,
    ArtifactGetCssRulesSchema,
    ArtifactValidateSchema,
} from '../tools/artifact.tools'

import {
    createRoadmap,
    saveRoadmap,
    listMemoryFiles,
    deleteMemory,
    getRoadmap,
    advanceRoadmapWeek,
    getCurrentWeekTasks,
    generateDailyPlan,
    getTodayTasks,
    updateTaskStatus,
    CreateRoadmapSchema,
    SaveRoadmapSchema,
    ListMemoryFilesSchema,
    DeleteMemorySchema,
    GetRoadmapSchema,
    AdvanceRoadmapWeekSchema,
    GetCurrentWeekTasksSchema,
    GenerateDailyPlanSchema,
    GetTodayTasksSchema,
    UpdateTaskStatusSchema,
} from '../tools/secretary.tools'

import type { ToolContext } from '../tools/core.tools'

// ============================================================================
// Tool Context Factory
// ============================================================================

export interface VercelToolContext {
    supabase: SupabaseClient
    userId: string
    config?: Record<string, unknown>
}

/**
 * Create tools bound to a specific context (user + supabase client)
 * Returns all 26 tools in Vercel AI SDK format
 */
export function createVercelTools(ctx: VercelToolContext) {
    const toolContext: ToolContext = {
        userId: ctx.userId,
        supabase: ctx.supabase,
        config: ctx.config,
    }

    return {
        // =====================================================================
        // Core Editing Tools (8)
        // =====================================================================

        read_block: tool({
            description: 'Read a specific block from a note by index, or read all blocks',
            parameters: ReadBlockSchema,
            execute: async (params) => {
                const result = await readBlock(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        read_note: tool({
            description: 'Read entire note content with metadata (title, content, timestamps)',
            parameters: ReadNoteSchema,
            execute: async (params) => {
                const result = await readNote(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        edit_block: tool({
            description: 'Edit a specific block or the entire note content',
            parameters: EditBlockSchema,
            execute: async (params) => {
                const result = await editBlock(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        search_web: tool({
            description: 'Search the web for information on a topic',
            parameters: SearchWebSchema,
            execute: async (params) => {
                const result = await searchWeb(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        create_artifact: tool({
            description: 'Create an HTML/CSS/JS visualization or interactive component',
            parameters: CreateArtifactSchema,
            execute: async (params) => {
                const result = await createArtifact(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        create_database: tool({
            description: 'Create an embedded database/table within a note',
            parameters: CreateDatabaseSchema,
            execute: async (params) => {
                const result = await createDatabase(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        read_memory_file: tool({
            description: 'Read AI memory (preferences, plans, daily notes, context)',
            parameters: ReadMemorySchema,
            execute: async (params) => {
                const result = await readMemory(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        write_memory_file: tool({
            description: 'Write/update AI memory content',
            parameters: WriteMemorySchema,
            execute: async (params) => {
                const result = await writeMemory(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        // =====================================================================
        // Database Tools (10)
        // =====================================================================

        db_add_row: tool({
            description: 'Add a new row to an embedded database',
            parameters: DbAddRowSchema,
            execute: async (params) => {
                const result = await dbAddRow(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_update_rows: tool({
            description: 'Update rows matching criteria in an embedded database',
            parameters: DbUpdateRowsSchema,
            execute: async (params) => {
                const result = await dbUpdateRows(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_delete_rows: tool({
            description: 'Delete rows matching criteria from an embedded database',
            parameters: DbDeleteRowsSchema,
            execute: async (params) => {
                const result = await dbDeleteRows(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_query_rows: tool({
            description: 'Query rows from an embedded database with filters',
            parameters: DbQueryRowsSchema,
            execute: async (params) => {
                const result = await dbQueryRows(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_aggregate: tool({
            description: 'Compute aggregations (sum, avg, count, etc.) on database columns',
            parameters: DbAggregateSchema,
            execute: async (params) => {
                const result = await dbAggregate(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_group_by: tool({
            description: 'Group rows by column and compute aggregations',
            parameters: DbGroupBySchema,
            execute: async (params) => {
                const result = await dbGroupBy(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_column_stats: tool({
            description: 'Get statistical summary for a column (min, max, avg, etc.)',
            parameters: DbColumnStatsSchema,
            execute: async (params) => {
                const result = await dbColumnStats(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_sort_rows: tool({
            description: 'Sort database rows by one or more columns',
            parameters: DbSortRowsSchema,
            execute: async (params) => {
                const result = await dbSortRows(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_get_schema: tool({
            description: 'Get the schema (column definitions) of an embedded database',
            parameters: DbGetSchemaSchema,
            execute: async (params) => {
                const result = await dbGetSchema(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        db_create_chart_data: tool({
            description: 'Generate chart-ready data from database for visualization',
            parameters: DbCreateChartDataSchema,
            execute: async (params) => {
                const result = await dbCreateChartData(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        // =====================================================================
        // Artifact Tools (6)
        // =====================================================================

        artifact_modify_html: tool({
            description: 'Modify the HTML content of an artifact',
            parameters: ArtifactModifyHtmlSchema,
            execute: async (params) => {
                const result = await artifactModifyHtml(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        artifact_modify_css: tool({
            description: 'Modify the CSS styles of an artifact',
            parameters: ArtifactModifyCssSchema,
            execute: async (params) => {
                const result = await artifactModifyCss(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        artifact_modify_js: tool({
            description: 'Modify the JavaScript code of an artifact',
            parameters: ArtifactModifyJsSchema,
            execute: async (params) => {
                const result = await artifactModifyJs(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        artifact_parse_structure: tool({
            description: 'Parse and extract the structure of an artifact HTML',
            parameters: ArtifactParseStructureSchema,
            execute: async (params) => {
                const result = await artifactParseStructure(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        artifact_get_css_rules: tool({
            description: 'Extract CSS rules from an artifact',
            parameters: ArtifactGetCssRulesSchema,
            execute: async (params) => {
                const result = await artifactGetCssRules(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        artifact_validate: tool({
            description: 'Validate artifact syntax (HTML, CSS, JS)',
            parameters: ArtifactValidateSchema,
            execute: async (params) => {
                const result = await artifactValidate(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        // =====================================================================
        // Secretary/Planner Tools (7)
        // =====================================================================

        create_roadmap: tool({
            description: 'Create a new learning roadmap with phases, themes, and milestones',
            parameters: CreateRoadmapSchema,
            execute: async (params) => {
                const result = await createRoadmap(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        save_roadmap: tool({
            description: 'Save/update an existing roadmap with new data',
            parameters: SaveRoadmapSchema,
            execute: async (params) => {
                const result = await saveRoadmap(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        list_memory_files: tool({
            description: 'List all AI memory types with optional content preview',
            parameters: ListMemoryFilesSchema,
            execute: async (params) => {
                const result = await listMemoryFiles(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        delete_memory_file: tool({
            description: 'Delete a specific memory type',
            parameters: DeleteMemorySchema,
            execute: async (params) => {
                const result = await deleteMemory(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        get_roadmap: tool({
            description: 'Get roadmap details by ID or list active roadmaps',
            parameters: GetRoadmapSchema,
            execute: async (params) => {
                const result = await getRoadmap(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        advance_roadmap_week: tool({
            description: 'Advance a roadmap to the next week',
            parameters: AdvanceRoadmapWeekSchema,
            execute: async (params) => {
                const result = await advanceRoadmapWeek(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        get_current_week_tasks: tool({
            description: 'Get the current week tasks, focus, and resources from a roadmap',
            parameters: GetCurrentWeekTasksSchema,
            execute: async (params) => {
                const result = await getCurrentWeekTasks(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        // =====================================================================
        // Phase 2.2: Daily Planning Tools (3)
        // =====================================================================

        generate_daily_plan: tool({
            description: 'Generate today\'s study plan from active roadmaps',
            parameters: GenerateDailyPlanSchema,
            execute: async (params) => {
                const result = await generateDailyPlan(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        get_today_tasks: tool({
            description: 'Get today\'s tasks with progress info',
            parameters: GetTodayTasksSchema,
            execute: async (params) => {
                const result = await getTodayTasks(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),

        update_task_status: tool({
            description: 'Mark a task as done, in progress, or skipped',
            parameters: UpdateTaskStatusSchema,
            execute: async (params) => {
                const result = await updateTaskStatus(params, toolContext)
                return result.success ? result.data : { error: result.error }
            },
        }),
    }
}

// ============================================================================
// Tool Subsets for Different Agents
// ============================================================================

/**
 * Get core tools only (for chat agent)
 */
export function getCoreTools(ctx: VercelToolContext) {
    const allTools = createVercelTools(ctx)
    return {
        read_note: allTools.read_note,
        read_block: allTools.read_block,
        search_web: allTools.search_web,
    }
}

/**
 * Get secretary tools (for secretary agent)
 */
export function getSecretaryTools(ctx: VercelToolContext) {
    const allTools = createVercelTools(ctx)
    return {
        // Memory tools
        read_memory_file: allTools.read_memory_file,
        write_memory_file: allTools.write_memory_file,
        list_memory_files: allTools.list_memory_files,
        delete_memory_file: allTools.delete_memory_file,
        // Roadmap tools
        create_roadmap: allTools.create_roadmap,
        save_roadmap: allTools.save_roadmap,
        get_roadmap: allTools.get_roadmap,
        advance_roadmap_week: allTools.advance_roadmap_week,
        get_current_week_tasks: allTools.get_current_week_tasks,
        // Phase 2.2: Daily planning tools
        generate_daily_plan: allTools.generate_daily_plan,
        get_today_tasks: allTools.get_today_tasks,
        update_task_status: allTools.update_task_status,
        // Note tools
        read_note: allTools.read_note,
        edit_block: allTools.edit_block,
        // Artifact tools
        create_artifact: allTools.create_artifact,
    }
}

/**
 * Get note agent tools
 */
export function getNoteTools(ctx: VercelToolContext) {
    const allTools = createVercelTools(ctx)
    return {
        read_note: allTools.read_note,
        read_block: allTools.read_block,
        edit_block: allTools.edit_block,
    }
}

/**
 * Get database tools (for database operations)
 */
export function getDatabaseTools(ctx: VercelToolContext) {
    const allTools = createVercelTools(ctx)
    return {
        db_add_row: allTools.db_add_row,
        db_update_rows: allTools.db_update_rows,
        db_delete_rows: allTools.db_delete_rows,
        db_query_rows: allTools.db_query_rows,
        db_aggregate: allTools.db_aggregate,
        db_group_by: allTools.db_group_by,
        db_column_stats: allTools.db_column_stats,
        db_sort_rows: allTools.db_sort_rows,
        db_get_schema: allTools.db_get_schema,
        db_create_chart_data: allTools.db_create_chart_data,
    }
}

/**
 * Get artifact tools
 */
export function getArtifactTools(ctx: VercelToolContext) {
    const allTools = createVercelTools(ctx)
    return {
        create_artifact: allTools.create_artifact,
        artifact_modify_html: allTools.artifact_modify_html,
        artifact_modify_css: allTools.artifact_modify_css,
        artifact_modify_js: allTools.artifact_modify_js,
        artifact_parse_structure: allTools.artifact_parse_structure,
        artifact_get_css_rules: allTools.artifact_get_css_rules,
        artifact_validate: allTools.artifact_validate,
    }
}

// Export type for tools
export type VercelTools = ReturnType<typeof createVercelTools>
export type SecretaryTools = ReturnType<typeof getSecretaryTools>
export type CoreTools = ReturnType<typeof getCoreTools>
