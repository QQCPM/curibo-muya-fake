/**
 * Secretary/Planner Tools (7 tools)
 * 
 * Tools for the Secretary agent to manage learning roadmaps and memory.
 * From Note3: create_roadmap, save_roadmap, read_memory_file, write_memory_file,
 * list_memory_files, delete_memory_file, rename_memory_file
 * 
 * Note: read_memory_file and write_memory_file are in core.tools.ts,
 * so we add the remaining 5 + 2 additional roadmap tools = 7 total
 */

import { z } from 'zod'
import { ToolContext, ToolResult } from './core.tools'

// ============================================================================
// Types for Roadmaps
// ============================================================================

interface RoadmapPhase {
    name: string
    weeks: number
    themes: {
        week: number
        focus: string
        topics: string[]
        resources: string[]
    }[]
}

interface RoadmapMilestone {
    week: number
    title: string
    description: string
    completed: boolean
}

interface RoadmapPreferences {
    hoursPerDay: number
    focusTime: string
    breakFrequency: string
}

export interface LearningRoadmap {
    id: string
    title: string
    description?: string
    topic?: string
    status: 'active' | 'completed' | 'archived' | 'paused'
    currentWeek: number
    totalWeeks: number
    startDate: string
    endDate?: string
    content: {
        phases: RoadmapPhase[]
        milestones: RoadmapMilestone[]
        preferences: RoadmapPreferences
    }
    createdAt: string
    updatedAt: string
}

// ============================================================================
// Schema Definitions
// ============================================================================

export const CreateRoadmapSchema = z.object({
    title: z.string().min(1).describe('Title for the learning roadmap'),
    description: z.string().optional().describe('Description of the learning goal'),
    topic: z.string().describe('Main topic/subject to learn'),
    totalWeeks: z.number().int().min(1).max(52).describe('Total duration in weeks'),
    phases: z.array(z.object({
        name: z.string(),
        weeks: z.number().int().min(1),
        themes: z.array(z.object({
            week: z.number().int().min(1),
            focus: z.string(),
            topics: z.array(z.string()),
            resources: z.array(z.string()),
        })),
    })).describe('Learning phases with weekly themes'),
    milestones: z.array(z.object({
        week: z.number().int().min(1),
        title: z.string(),
        description: z.string(),
    })).optional().describe('Key milestones to achieve'),
    preferences: z.object({
        hoursPerDay: z.number().min(0.5).max(12).default(2),
        focusTime: z.string().default('morning'),
        breakFrequency: z.string().default('25min'),
    }).optional().describe('User learning preferences'),
})

export const SaveRoadmapSchema = z.object({
    roadmapId: z.string().uuid().describe('ID of the roadmap to save/update'),
    updates: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['active', 'completed', 'archived', 'paused']).optional(),
        currentWeek: z.number().int().min(1).optional(),
        content: z.any().optional(),
    }).describe('Updates to apply to the roadmap'),
})

export const ListMemoryFilesSchema = z.object({
    includeContent: z.boolean().optional().default(false).describe('Include content preview in listing'),
})

export const DeleteMemorySchema = z.object({
    memoryType: z.enum(['preferences', 'plan_index', 'daily', 'today', 'tomorrow', 'context'])
        .describe('Type of memory to delete'),
})

export const GetRoadmapSchema = z.object({
    roadmapId: z.string().uuid().optional().describe('Specific roadmap ID, or get all active roadmaps'),
    status: z.enum(['active', 'completed', 'archived', 'paused', 'all']).optional().default('active')
        .describe('Filter by status'),
})

export const AdvanceRoadmapWeekSchema = z.object({
    roadmapId: z.string().uuid().describe('ID of the roadmap to advance'),
})

export const GetCurrentWeekTasksSchema = z.object({
    roadmapId: z.string().uuid().describe('ID of the roadmap'),
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateRoadmapInput = z.infer<typeof CreateRoadmapSchema>
export type SaveRoadmapInput = z.infer<typeof SaveRoadmapSchema>
export type ListMemoryFilesInput = z.infer<typeof ListMemoryFilesSchema>
export type DeleteMemoryInput = z.infer<typeof DeleteMemorySchema>
export type GetRoadmapInput = z.infer<typeof GetRoadmapSchema>
export type AdvanceRoadmapWeekInput = z.infer<typeof AdvanceRoadmapWeekSchema>
export type GetCurrentWeekTasksInput = z.infer<typeof GetCurrentWeekTasksSchema>

// ============================================================================
// Tool Implementations
// ============================================================================

/**
 * Create a new learning roadmap
 */
export async function createRoadmap(
    input: CreateRoadmapInput,
    ctx: ToolContext
): Promise<ToolResult<{ roadmapId: string; roadmap: LearningRoadmap }>> {
    try {
        const roadmapId = crypto.randomUUID()
        const now = new Date().toISOString()

        const roadmap: LearningRoadmap = {
            id: roadmapId,
            title: input.title,
            description: input.description,
            topic: input.topic,
            status: 'active',
            currentWeek: 1,
            totalWeeks: input.totalWeeks,
            startDate: now.split('T')[0],
            content: {
                phases: input.phases,
                milestones: (input.milestones || []).map(m => ({ ...m, completed: false })),
                preferences: input.preferences || {
                    hoursPerDay: 2,
                    focusTime: 'morning',
                    breakFrequency: '25min',
                },
            },
            createdAt: now,
            updatedAt: now,
        }

        const { error } = await ctx.supabase
            .from('learning_roadmaps')
            .insert({
                id: roadmapId,
                user_id: ctx.userId,
                title: roadmap.title,
                description: roadmap.description,
                topic: roadmap.topic,
                status: roadmap.status,
                current_week: roadmap.currentWeek,
                total_weeks: roadmap.totalWeeks,
                start_date: roadmap.startDate,
                content: roadmap.content,
            })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: { roadmapId, roadmap } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Save/update an existing roadmap
 */
export async function saveRoadmap(
    input: SaveRoadmapInput,
    ctx: ToolContext
): Promise<ToolResult<{ updated: boolean }>> {
    try {
        const updateData: Record<string, unknown> = {}

        if (input.updates.title) updateData.title = input.updates.title
        if (input.updates.description !== undefined) updateData.description = input.updates.description
        if (input.updates.status) updateData.status = input.updates.status
        if (input.updates.currentWeek) updateData.current_week = input.updates.currentWeek
        if (input.updates.content) updateData.content = input.updates.content

        const { error } = await ctx.supabase
            .from('learning_roadmaps')
            .update(updateData)
            .eq('id', input.roadmapId)
            .eq('user_id', ctx.userId)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: { updated: true } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * List all memory types with optional content preview
 */
export async function listMemoryFiles(
    input: ListMemoryFilesInput,
    ctx: ToolContext
): Promise<ToolResult<{ memories: { type: string; updatedAt: string; preview?: string }[] }>> {
    try {
        const { data, error } = await ctx.supabase.rpc('list_ai_memory_types', {
            p_user_id: ctx.userId,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        const memories = (data || []).map((item: { memory_type: string; updated_at: string }) => {
            const memory: { type: string; updatedAt: string; preview?: string } = {
                type: item.memory_type,
                updatedAt: item.updated_at,
            }
            return memory
        })

        // If content preview requested, fetch content for each
        if (input.includeContent && memories.length > 0) {
            for (const memory of memories) {
                const { data: content } = await ctx.supabase
                    .rpc('get_ai_memory', {
                        p_user_id: ctx.userId,
                        p_memory_type: memory.type,
                    })
                    .single<{ content: string }>()

                if (content?.content) {
                    memory.preview = content.content.slice(0, 100) + (content.content.length > 100 ? '...' : '')
                }
            }
        }

        return { success: true, data: { memories } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Delete a memory type
 */
export async function deleteMemory(
    input: DeleteMemoryInput,
    ctx: ToolContext
): Promise<ToolResult<{ deleted: boolean }>> {
    try {
        const { data, error } = await ctx.supabase.rpc('delete_ai_memory', {
            p_user_id: ctx.userId,
            p_memory_type: input.memoryType,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: { deleted: data === true } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Get roadmaps (single or filtered list)
 */
export async function getRoadmap(
    input: GetRoadmapInput,
    ctx: ToolContext
): Promise<ToolResult<{ roadmaps: LearningRoadmap[] }>> {
    try {
        let query = ctx.supabase
            .from('learning_roadmaps')
            .select('*')
            .eq('user_id', ctx.userId)

        if (input.roadmapId) {
            query = query.eq('id', input.roadmapId)
        } else if (input.status && input.status !== 'all') {
            query = query.eq('status', input.status)
        }

        const { data, error } = await query.order('updated_at', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        const roadmaps = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            title: row.title as string,
            description: row.description as string | undefined,
            topic: row.topic as string | undefined,
            status: row.status as LearningRoadmap['status'],
            currentWeek: row.current_week as number,
            totalWeeks: row.total_weeks as number,
            startDate: row.start_date as string,
            endDate: row.end_date as string | undefined,
            content: row.content as LearningRoadmap['content'],
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        }))

        return { success: true, data: { roadmaps } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Advance roadmap to next week
 */
export async function advanceRoadmapWeek(
    input: AdvanceRoadmapWeekInput,
    ctx: ToolContext
): Promise<ToolResult<{ newWeek: number; completed: boolean }>> {
    try {
        // Get current roadmap
        const { data: roadmap, error: readError } = await ctx.supabase
            .from('learning_roadmaps')
            .select('current_week, total_weeks')
            .eq('id', input.roadmapId)
            .eq('user_id', ctx.userId)
            .single()

        if (readError || !roadmap) {
            return { success: false, error: 'Roadmap not found' }
        }

        const currentWeek = roadmap.current_week as number
        const totalWeeks = roadmap.total_weeks as number
        const newWeek = Math.min(currentWeek + 1, totalWeeks)
        const completed = newWeek >= totalWeeks

        const updateData: Record<string, unknown> = { current_week: newWeek }
        if (completed) {
            updateData.status = 'completed'
        }

        const { error: updateError } = await ctx.supabase
            .from('learning_roadmaps')
            .update(updateData)
            .eq('id', input.roadmapId)
            .eq('user_id', ctx.userId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        return { success: true, data: { newWeek, completed } }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Get current week's tasks from roadmap
 */
export async function getCurrentWeekTasks(
    input: GetCurrentWeekTasksInput,
    ctx: ToolContext
): Promise<ToolResult<{
    week: number
    focus: string
    topics: string[]
    resources: string[]
    phaseName: string
}>> {
    try {
        const { data: roadmap, error } = await ctx.supabase
            .from('learning_roadmaps')
            .select('current_week, content')
            .eq('id', input.roadmapId)
            .eq('user_id', ctx.userId)
            .single()

        if (error || !roadmap) {
            return { success: false, error: 'Roadmap not found' }
        }

        const currentWeek = roadmap.current_week as number
        const content = roadmap.content as LearningRoadmap['content']

        // Find the phase and theme for current week
        for (const phase of content.phases) {
            for (const theme of phase.themes) {
                if (theme.week === currentWeek) {
                    return {
                        success: true,
                        data: {
                            week: currentWeek,
                            focus: theme.focus,
                            topics: theme.topics,
                            resources: theme.resources,
                            phaseName: phase.name,
                        },
                    }
                }
            }
        }

        return { success: false, error: `No theme found for week ${currentWeek}` }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

// ============================================================================
// Phase 2.2: New Daily Planning Tools (3 tools)
// ============================================================================

export const GenerateDailyPlanSchema = z.object({})

export const GetTodayTasksSchema = z.object({
    includeCompleted: z.boolean().optional().default(false)
        .describe('Include completed/skipped tasks in the list'),
})

export const UpdateTaskStatusSchema = z.object({
    taskId: z.string().uuid().describe('ID of the task to update'),
    status: z.enum(['done', 'in_progress', 'skipped'])
        .describe('New status for the task'),
})

export type GenerateDailyPlanInput = z.infer<typeof GenerateDailyPlanSchema>
export type GetTodayTasksInput = z.infer<typeof GetTodayTasksSchema>
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>

/**
 * Generate today's study plan from active roadmaps
 * Uses AI to create personalized daily tasks
 */
export async function generateDailyPlan(
    _input: GenerateDailyPlanInput,
    ctx: ToolContext
): Promise<ToolResult<{
    plan: {
        date: string
        focus: string
        tasks: Array<{
            id: string
            description: string
            priority: string
            estimatedMinutes: number
            status: string
        }>
        estimatedMinutes: number
    }
}>> {
    try {
        const today = new Date().toISOString().split('T')[0]

        // Check if we already have today's plan
        const { data: existingPlan } = await ctx.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', ctx.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (existingPlan?.content?.date === today) {
            const plan = existingPlan.content
            return {
                success: true,
                data: {
                    plan: {
                        date: plan.date,
                        focus: plan.focus,
                        tasks: plan.tasks,
                        estimatedMinutes: plan.estimatedMinutes,
                    },
                },
            }
        }

        // Get active roadmaps
        const { data: roadmaps } = await ctx.supabase
            .from('learning_roadmaps')
            .select('id, title, topic, current_week, total_weeks, content')
            .eq('user_id', ctx.userId)
            .eq('status', 'active')

        if (!roadmaps || roadmaps.length === 0) {
            // No active roadmaps, create a minimal plan
            const emptyPlan = {
                id: crypto.randomUUID(),
                date: today,
                focus: 'No active roadmaps. Create a learning roadmap to get personalized tasks.',
                tasks: [],
                estimatedMinutes: 0,
                completedMinutes: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            await ctx.supabase.from('ai_memory').upsert({
                user_id: ctx.userId,
                memory_type: 'daily_plan',
                content: emptyPlan,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,memory_type' })

            return {
                success: true,
                data: {
                    plan: {
                        date: emptyPlan.date,
                        focus: emptyPlan.focus,
                        tasks: [],
                        estimatedMinutes: 0,
                    },
                },
            }
        }

        // Create a simple plan from roadmap data
        const tasks: Array<{
            id: string
            description: string
            priority: string
            estimatedMinutes: number
            status: string
        }> = []

        for (const roadmap of roadmaps.slice(0, 2)) {
            const content = roadmap.content as {
                phases: Array<{
                    name: string
                    themes: Array<{
                        week: number
                        focus: string
                        topics: string[]
                    }>
                }>
            }

            for (const phase of content.phases || []) {
                for (const theme of phase.themes || []) {
                    if (theme.week === roadmap.current_week) {
                        // Add a task for each topic (max 2 per roadmap)
                        for (const topic of theme.topics.slice(0, 2)) {
                            tasks.push({
                                id: crypto.randomUUID(),
                                description: `Study: ${topic} (${roadmap.title})`,
                                priority: 'medium',
                                estimatedMinutes: 30,
                                status: 'pending',
                            })
                        }
                    }
                }
            }
        }

        const focus = roadmaps.length > 0
            ? `Focus on ${roadmaps.map(r => r.topic || r.title).join(' and ')}`
            : 'Plan your learning goals'

        const now = new Date().toISOString()
        const newPlan = {
            id: crypto.randomUUID(),
            date: today,
            focus,
            tasks,
            estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
            completedMinutes: 0,
            createdAt: now,
            updatedAt: now,
        }

        await ctx.supabase.from('ai_memory').upsert({
            user_id: ctx.userId,
            memory_type: 'daily_plan',
            content: newPlan,
            updated_at: now,
        }, { onConflict: 'user_id,memory_type' })

        return {
            success: true,
            data: {
                plan: {
                    date: newPlan.date,
                    focus: newPlan.focus,
                    tasks: newPlan.tasks,
                    estimatedMinutes: newPlan.estimatedMinutes,
                },
            },
        }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Get today's tasks from the daily plan
 */
export async function getTodayTasks(
    input: GetTodayTasksInput,
    ctx: ToolContext
): Promise<ToolResult<{
    date: string
    focus: string
    tasks: Array<{
        id: string
        description: string
        priority: string
        estimatedMinutes: number
        status: string
    }>
    progress: {
        completed: number
        total: number
        completedMinutes: number
        estimatedMinutes: number
    }
}>> {
    try {
        const { data: memoryData } = await ctx.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', ctx.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (!memoryData?.content) {
            return { success: false, error: 'No daily plan found. Generate one first.' }
        }

        const plan = memoryData.content as {
            date: string
            focus: string
            tasks: Array<{
                id: string
                description: string
                priority: string
                estimatedMinutes: number
                status: string
            }>
            estimatedMinutes: number
            completedMinutes: number
        }

        // Check if plan is for today
        const today = new Date().toISOString().split('T')[0]
        if (plan.date !== today) {
            return { success: false, error: 'Daily plan is outdated. Generate a new one.' }
        }

        // Filter tasks based on includeCompleted
        let tasks = plan.tasks
        if (!input.includeCompleted) {
            tasks = tasks.filter(t => t.status !== 'done' && t.status !== 'skipped')
        }

        const completedCount = plan.tasks.filter(t => t.status === 'done').length

        return {
            success: true,
            data: {
                date: plan.date,
                focus: plan.focus,
                tasks,
                progress: {
                    completed: completedCount,
                    total: plan.tasks.length,
                    completedMinutes: plan.completedMinutes || 0,
                    estimatedMinutes: plan.estimatedMinutes,
                },
            },
        }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

/**
 * Update a task's status (done, in_progress, skipped)
 */
export async function updateTaskStatus(
    input: UpdateTaskStatusInput,
    ctx: ToolContext
): Promise<ToolResult<{
    updated: boolean
    task: {
        id: string
        description: string
        status: string
    }
    progress: {
        completed: number
        total: number
    }
}>> {
    try {
        const { data: memoryData } = await ctx.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', ctx.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (!memoryData?.content) {
            return { success: false, error: 'No daily plan found' }
        }

        const plan = memoryData.content as {
            tasks: Array<{
                id: string
                description: string
                status: string
                estimatedMinutes: number
            }>
            completedMinutes: number
        }

        const task = plan.tasks.find(t => t.id === input.taskId)
        if (!task) {
            return { success: false, error: `Task not found: ${input.taskId}` }
        }

        const previousStatus = task.status
        task.status = input.status

        // Update completed minutes
        if (input.status === 'done' && previousStatus !== 'done') {
            plan.completedMinutes = (plan.completedMinutes || 0) + task.estimatedMinutes
        } else if (previousStatus === 'done' && input.status !== 'done') {
            plan.completedMinutes = Math.max(0, (plan.completedMinutes || 0) - task.estimatedMinutes)
        }

        // Save updated plan
        await ctx.supabase.from('ai_memory').upsert({
            user_id: ctx.userId,
            memory_type: 'daily_plan',
            content: { ...memoryData.content, ...plan },
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,memory_type',
        })

        const completedCount = plan.tasks.filter(t => t.status === 'done').length

        return {
            success: true,
            data: {
                updated: true,
                task: {
                    id: task.id,
                    description: task.description,
                    status: task.status,
                },
                progress: {
                    completed: completedCount,
                    total: plan.tasks.length,
                },
            },
        }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

// ============================================================================
// Tool Definitions for LangGraph
// ============================================================================

export const secretaryTools = [
    { name: 'create_roadmap', description: 'Create a new learning roadmap with phases, weeks, and milestones', schema: CreateRoadmapSchema, execute: createRoadmap },
    { name: 'save_roadmap', description: 'Save or update an existing learning roadmap', schema: SaveRoadmapSchema, execute: saveRoadmap },
    { name: 'list_memory_files', description: 'List all AI memory types (preferences, plans, daily notes)', schema: ListMemoryFilesSchema, execute: listMemoryFiles },
    { name: 'delete_memory_file', description: 'Delete a specific AI memory type', schema: DeleteMemorySchema, execute: deleteMemory },
    { name: 'get_roadmap', description: 'Get learning roadmaps by ID or filter by status', schema: GetRoadmapSchema, execute: getRoadmap },
    { name: 'advance_roadmap_week', description: 'Advance a roadmap to the next week', schema: AdvanceRoadmapWeekSchema, execute: advanceRoadmapWeek },
    { name: 'get_current_week_tasks', description: 'Get the current week tasks and focus from a roadmap', schema: GetCurrentWeekTasksSchema, execute: getCurrentWeekTasks },
    // Phase 2.2: New Daily Planning Tools
    { name: 'generate_daily_plan', description: 'Generate today\'s study plan from active roadmaps', schema: GenerateDailyPlanSchema, execute: generateDailyPlan },
    { name: 'get_today_tasks', description: 'Get today\'s tasks with progress info', schema: GetTodayTasksSchema, execute: getTodayTasks },
    { name: 'update_task_status', description: 'Mark a task as done, in progress, or skipped', schema: UpdateTaskStatusSchema, execute: updateTaskStatus },
] as const

