/**
 * Daily Service
 * 
 * Manages daily study plans and task tracking based on learning roadmaps.
 * Generates personalized daily plans, tracks task completion, and 
 * coordinates with the AI memory system for persistence.
 * 
 * Phase 2.1 Implementation as per next_phases_plan.md
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// ============================================================================
// Types
// ============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped'
export type TaskSource = 'roadmap' | 'user' | 'ai'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface DailyTask {
    id: string
    description: string
    source: TaskSource
    priority: TaskPriority
    estimatedMinutes: number
    status: TaskStatus
    roadmapId?: string
    weekNumber?: number
}

export interface DailyPlan {
    id: string
    date: string  // ISO date YYYY-MM-DD
    focus: string
    tasks: DailyTask[]
    estimatedMinutes: number
    completedMinutes: number
    createdAt: string
    updatedAt: string
}

export interface WeekTask {
    roadmapId: string
    roadmapTitle: string
    week: number
    focus: string
    topics: string[]
    resources: string[]
}

export interface DailyServiceConfig {
    supabase: SupabaseClient
    userId: string
    openaiApiKey: string
}

// ============================================================================
// Daily Service Class
// ============================================================================

export class DailyService {
    private supabase: SupabaseClient
    private userId: string
    private openaiApiKey: string

    constructor(config: DailyServiceConfig) {
        this.supabase = config.supabase
        this.userId = config.userId
        this.openaiApiKey = config.openaiApiKey
    }

    /**
     * Generate today's study plan from active roadmaps
     */
    async generateDailyPlan(): Promise<DailyPlan> {
        const today = new Date().toISOString().split('T')[0]

        // Check if we already have today's plan
        const { data: existingPlan } = await this.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', this.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (existingPlan?.content?.date === today) {
            return existingPlan.content as DailyPlan
        }

        // Get active roadmaps
        const { data: roadmaps } = await this.supabase
            .from('learning_roadmaps')
            .select('id, title, topic, current_week, total_weeks, content')
            .eq('user_id', this.userId)
            .eq('status', 'active')

        if (!roadmaps || roadmaps.length === 0) {
            // No active roadmaps, create a minimal plan
            return this.createEmptyPlan(today)
        }

        // Get current week tasks from each roadmap
        const weekTasks = await this.getCurrentWeekTasks()

        // Generate AI-powered daily plan
        const plan = await this.generatePlanWithAI(today, weekTasks, roadmaps)

        // Save to memory
        await this.saveDailyPlan(plan)

        return plan
    }

    /**
     * Get tasks for current week from all active roadmaps
     */
    async getCurrentWeekTasks(): Promise<WeekTask[]> {
        const { data: roadmaps } = await this.supabase
            .from('learning_roadmaps')
            .select('id, title, current_week, content')
            .eq('user_id', this.userId)
            .eq('status', 'active')

        if (!roadmaps) return []

        const weekTasks: WeekTask[] = []

        for (const roadmap of roadmaps) {
            const content = roadmap.content as {
                phases: Array<{
                    name: string
                    themes: Array<{
                        week: number
                        focus: string
                        topics: string[]
                        resources: string[]
                    }>
                }>
            }

            // Find current week's theme
            for (const phase of content.phases || []) {
                for (const theme of phase.themes || []) {
                    if (theme.week === roadmap.current_week) {
                        weekTasks.push({
                            roadmapId: roadmap.id,
                            roadmapTitle: roadmap.title,
                            week: theme.week,
                            focus: theme.focus,
                            topics: theme.topics,
                            resources: theme.resources,
                        })
                    }
                }
            }
        }

        return weekTasks
    }

    /**
     * Mark a task as done, in progress, or skipped
     */
    async updateTaskStatus(taskId: string, status: TaskStatus): Promise<DailyPlan | null> {
        const { data: memoryData } = await this.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', this.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (!memoryData?.content) return null

        const plan = memoryData.content as DailyPlan
        const task = plan.tasks.find(t => t.id === taskId)

        if (!task) return null

        const previousStatus = task.status
        task.status = status
        plan.updatedAt = new Date().toISOString()

        // Update completed minutes
        if (status === 'done' && previousStatus !== 'done') {
            plan.completedMinutes += task.estimatedMinutes
        } else if (previousStatus === 'done' && status !== 'done') {
            plan.completedMinutes = Math.max(0, plan.completedMinutes - task.estimatedMinutes)
        }

        await this.saveDailyPlan(plan)
        return plan
    }

    /**
     * Archive today's plan (call before midnight transition)
     */
    async archiveTodayPlan(): Promise<void> {
        const { data: memoryData } = await this.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', this.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (!memoryData?.content) return

        const plan = memoryData.content as DailyPlan

        // Archive by saving to a different memory type with date
        await this.supabase.from('ai_memory').upsert({
            user_id: this.userId,
            memory_type: `archived_plan_${plan.date}`,
            content: plan,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,memory_type',
        })
    }

    /**
     * Get today's existing plan if any
     */
    async getTodayPlan(): Promise<DailyPlan | null> {
        const today = new Date().toISOString().split('T')[0]

        const { data } = await this.supabase
            .from('ai_memory')
            .select('content')
            .eq('user_id', this.userId)
            .eq('memory_type', 'daily_plan')
            .single()

        if (data?.content?.date === today) {
            return data.content as DailyPlan
        }

        return null
    }

    // ========================================================================
    // Private Methods
    // ========================================================================

    private async generatePlanWithAI(
        date: string,
        weekTasks: WeekTask[],
        roadmaps: Array<{ id: string; title: string; topic: string }>
    ): Promise<DailyPlan> {
        const openai = createOpenAI({ apiKey: this.openaiApiKey })

        const prompt = `Generate a focused daily study plan for today (${date}).

Active Roadmaps:
${roadmaps.map(r => `- "${r.title}" (${r.topic})`).join('\n')}

Current Week's Focus Areas:
${weekTasks.map(t => `- ${t.roadmapTitle}: "${t.focus}" - Topics: ${t.topics.join(', ')}`).join('\n')}

Create 3-5 specific, actionable tasks for today. Each task should:
1. Be completable in 15-45 minutes
2. Have clear success criteria
3. Be prioritized (high/medium/low)

Respond with valid JSON:
{
  "focus": "One sentence describing today's main focus",
  "tasks": [
    {
      "description": "Specific task description",
      "priority": "high|medium|low",
      "estimatedMinutes": 30,
      "roadmapId": "uuid or null"
    }
  ]
}

Only output valid JSON, no markdown.`

        try {
            const result = await generateText({
                model: openai('gpt-5.2'),
                messages: [{ role: 'user', content: prompt }],
            })

            const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim())

            const tasks: DailyTask[] = parsed.tasks.map((t: {
                description: string
                priority: TaskPriority
                estimatedMinutes: number
                roadmapId?: string
            }, i: number) => ({
                id: crypto.randomUUID(),
                description: t.description,
                source: t.roadmapId ? 'roadmap' : 'ai',
                priority: t.priority,
                estimatedMinutes: t.estimatedMinutes,
                status: 'pending',
                roadmapId: t.roadmapId,
            }))

            const now = new Date().toISOString()

            return {
                id: crypto.randomUUID(),
                date,
                focus: parsed.focus,
                tasks,
                estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
                completedMinutes: 0,
                createdAt: now,
                updatedAt: now,
            }
        } catch {
            // Fallback to simple plan if AI fails
            return this.createFallbackPlan(date, weekTasks)
        }
    }

    private createEmptyPlan(date: string): DailyPlan {
        const now = new Date().toISOString()
        return {
            id: crypto.randomUUID(),
            date,
            focus: 'No active roadmaps. Create a learning roadmap to get personalized tasks.',
            tasks: [],
            estimatedMinutes: 0,
            completedMinutes: 0,
            createdAt: now,
            updatedAt: now,
        }
    }

    private createFallbackPlan(date: string, weekTasks: WeekTask[]): DailyPlan {
        const now = new Date().toISOString()
        const tasks: DailyTask[] = []

        for (const wt of weekTasks.slice(0, 3)) {
            tasks.push({
                id: crypto.randomUUID(),
                description: `Study: ${wt.focus}`,
                source: 'roadmap',
                priority: 'medium',
                estimatedMinutes: 30,
                status: 'pending',
                roadmapId: wt.roadmapId,
                weekNumber: wt.week,
            })
        }

        return {
            id: crypto.randomUUID(),
            date,
            focus: weekTasks[0]?.focus || 'Focus on your current learning goals',
            tasks,
            estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
            completedMinutes: 0,
            createdAt: now,
            updatedAt: now,
        }
    }

    private async saveDailyPlan(plan: DailyPlan): Promise<void> {
        await this.supabase.from('ai_memory').upsert({
            user_id: this.userId,
            memory_type: 'daily_plan',
            content: plan,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,memory_type',
        })
    }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createDailyService(config: DailyServiceConfig): DailyService {
    return new DailyService(config)
}
