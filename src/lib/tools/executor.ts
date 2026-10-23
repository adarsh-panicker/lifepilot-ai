import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  logActivity,
} from '../db';
import { Task, DailyPlan, DailyPlanItem, ProductivityInsights } from '../types';
import { isOverdue } from '../utils';

export interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  data?: unknown;
  error?: string;
  userMessage?: string;
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  intent: string = 'natural language query'
): Promise<ToolExecutionResult> {
  try {
    let result: unknown;
    let userMessage = '';

    switch (toolName) {
      case 'create_task': {
        const title = typeof args.title === 'string' ? args.title.trim() : '';
        if (!title) {
          throw new Error('Task title cannot be empty.');
        }

        const description = typeof args.description === 'string' ? args.description.trim() : '';
        const priority = ['high', 'medium', 'low'].includes(String(args.priority).toLowerCase())
          ? (String(args.priority).toLowerCase() as 'high' | 'medium' | 'low')
          : 'medium';

        const category = ['Work', 'Study', 'Health', 'Personal', 'Other'].includes(String(args.category))
          ? (String(args.category) as 'Work' | 'Study' | 'Health' | 'Personal' | 'Other')
          : 'Work';

        let dueDate = typeof args.dueDate === 'string' ? args.dueDate : undefined;
        // If due date was expressed in relative text, or empty, set to today 8 PM
        if (!dueDate || isNaN(new Date(dueDate).getTime())) {
          const d = new Date();
          d.setHours(20, 0, 0, 0);
          dueDate = d.toISOString();
        }

        const estMinutes =
          typeof args.estimatedMinutes === 'number' && args.estimatedMinutes > 0
            ? Math.min(args.estimatedMinutes, 480)
            : 30;

        const task = createTask({
          title,
          description,
          priority,
          category,
          dueDate,
          estimatedMinutes: estMinutes,
        });

        result = task;
        userMessage = `Task created: "${task.title}" with ${task.priority.toUpperCase()} priority (est. ${task.estimatedMinutes}m).`;
        break;
      }

      case 'list_tasks': {
        const status =
          args.status === 'completed' || args.status === 'pending' || args.status === 'all'
            ? args.status
            : 'pending';

        const priority = typeof args.priority === 'string' ? args.priority : undefined;
        const category = typeof args.category === 'string' ? args.category : undefined;
        const search = typeof args.search === 'string' ? args.search : undefined;

        const tasks = getAllTasks({ status, priority, category, search });
        result = {
          count: tasks.length,
          filter: { status, priority, category, search },
          tasks,
        };
        userMessage = `Found ${tasks.length} task(s).`;
        break;
      }

      case 'complete_task': {
        let taskId = typeof args.id === 'string' ? args.id : undefined;
        const titleQuery = typeof args.titleQuery === 'string' ? args.titleQuery.toLowerCase() : '';

        // If ID wasn't provided, try searching pending tasks by title query
        if (!taskId && titleQuery) {
          const pending = getAllTasks({ status: 'pending' });
          const matched = pending.find(
            (t) => t.title.toLowerCase().includes(titleQuery) || titleQuery.includes(t.title.toLowerCase())
          );
          if (matched) {
            taskId = matched.id;
          }
        }

        if (!taskId) {
          throw new Error('Task could not be found to mark complete. Please provide a valid task ID or title.');
        }

        const updated = updateTask(taskId, { completed: true });
        if (!updated) {
          throw new Error(`Task with ID ${taskId} not found.`);
        }

        result = updated;
        userMessage = `Marked task "${updated.title}" as completed!`;
        break;
      }

      case 'update_task': {
        const taskId = typeof args.id === 'string' ? args.id : undefined;
        if (!taskId) {
          throw new Error('Task ID is required to update a task.');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = {};
        if (typeof args.title === 'string' && args.title.trim()) updates.title = args.title.trim();
        if (typeof args.description === 'string') updates.description = args.description.trim();
        if (['high', 'medium', 'low'].includes(String(args.priority).toLowerCase())) {
          updates.priority = String(args.priority).toLowerCase();
        }
        if (typeof args.dueDate === 'string' && !isNaN(new Date(args.dueDate).getTime())) {
          updates.dueDate = args.dueDate;
        }
        if (typeof args.estimatedMinutes === 'number' && args.estimatedMinutes > 0) {
          updates.estimatedMinutes = Math.min(args.estimatedMinutes, 480);
        }

        const updated = updateTask(taskId, updates);
        if (!updated) {
          throw new Error(`Task with ID ${taskId} not found.`);
        }

        result = updated;
        userMessage = `Updated task "${updated.title}".`;
        break;
      }

      case 'get_daily_summary': {
        const allTasks = getAllTasks();
        const completed = allTasks.filter((t) => t.completed);
        const pending = allTasks.filter((t) => !t.completed);
        const overdue = pending.filter((t) => isOverdue(t.dueDate, t.completed));
        const highPriority = pending.filter((t) => t.priority === 'high');

        const totalEstMinutes = pending.reduce((acc, t) => acc + t.estimatedMinutes, 0);

        const summary: ProductivityInsights = {
          totalTasks: allTasks.length,
          completedTasks: completed.length,
          pendingTasks: pending.length,
          overdueTasks: overdue.length,
          completionRate: allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0,
          totalEstimatedMinutes: totalEstMinutes,
          completedMinutes: completed.reduce((acc, t) => acc + t.estimatedMinutes, 0),
          priorityBreakdown: {
            high: pending.filter((t) => t.priority === 'high').length,
            medium: pending.filter((t) => t.priority === 'medium').length,
            low: pending.filter((t) => t.priority === 'low').length,
          },
          categoryBreakdown: pending.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          insights: [
            overdue.length > 0
              ? `You have ${overdue.length} overdue task(s). Prioritize these first!`
              : 'Great job! You have zero overdue tasks.',
            highPriority.length > 0
              ? `${highPriority.length} high-priority item(s) require your focus today.`
              : 'No high-priority blockers at the moment.',
            `Total pending workload is estimated at ~${Math.round(totalEstMinutes / 60)}h ${totalEstMinutes % 60}m.`,
          ],
        };

        result = summary;
        userMessage = `Summary: ${pending.length} pending tasks (${overdue.length} overdue, ${highPriority.length} high priority), ~${Math.round(totalEstMinutes / 60)}h workload.`;
        break;
      }

      case 'generate_daily_plan': {
        const availableHours = typeof args.availableHours === 'number' && args.availableHours > 0 ? args.availableHours : 6;
        const availableMinutes = Math.min(availableHours * 60, 720); // max 12 hours
        const startHour = typeof args.startHour === 'number' && args.startHour >= 0 && args.startHour <= 23 ? args.startHour : 9;

        const pending = getAllTasks({ status: 'pending' });

        // Sort by: Overdue first, then High priority, then earliest due date
        const sorted = [...pending].sort((a, b) => {
          const aOverdue = isOverdue(a.dueDate, a.completed);
          const bOverdue = isOverdue(b.dueDate, b.completed);
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;

          const priorityWeight = { high: 3, medium: 2, low: 1 };
          if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          }

          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        const items: DailyPlanItem[] = [];
        let currentMinutes = startHour * 60;
        let totalPlannedMinutes = 0;

        for (let i = 0; i < sorted.length; i++) {
          const task = sorted[i];
          const taskDuration = Math.min(task.estimatedMinutes || 45, 120);

          if (totalPlannedMinutes + taskDuration > availableMinutes) {
            // Cannot fit entire task; check if at least 25 min fit
            const remainingMins = availableMinutes - totalPlannedMinutes;
            if (remainingMins >= 25) {
              const startH = Math.floor(currentMinutes / 60);
              const startM = currentMinutes % 60;
              const endMins = currentMinutes + remainingMins;
              const endH = Math.floor(endMins / 60);
              const endM = endMins % 60;

              items.push({
                id: `plan_${task.id}_part`,
                taskId: task.id,
                title: `${task.title} (Part 1 - ${remainingMins}m focus sprint)`,
                category: task.category,
                priority: task.priority,
                startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
                endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
                durationMinutes: remainingMins,
                reason: `Allocated initial focus block within your ${availableHours}h limit. High impact start.`,
              });
              totalPlannedMinutes += remainingMins;
            }
            break;
          }

          const startH = Math.floor(currentMinutes / 60);
          const startM = currentMinutes % 60;
          const endMins = currentMinutes + taskDuration;
          const endH = Math.floor(endMins / 60);
          const endM = endMins % 60;

          let reason = '';
          if (isOverdue(task.dueDate, task.completed)) {
            reason = 'Prioritized first because this task is overdue or due very soon.';
          } else if (task.priority === 'high') {
            reason = 'High priority critical deliverable requiring peak energy.';
          } else if (task.priority === 'medium') {
            reason = 'Medium priority task to maintain momentum.';
          } else {
            reason = 'Low priority task to close out the session smoothly.';
          }

          items.push({
            id: `plan_${task.id}`,
            taskId: task.id,
            title: task.title,
            category: task.category,
            priority: task.priority,
            startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
            endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
            durationMinutes: taskDuration,
            reason,
          });

          currentMinutes += taskDuration;
          totalPlannedMinutes += taskDuration;

          // Insert a 10-minute break after every ~90 minutes of continuous work
          if (i < sorted.length - 1 && totalPlannedMinutes + 10 <= availableMinutes) {
            const breakStartH = Math.floor(currentMinutes / 60);
            const breakStartM = currentMinutes % 60;
            const breakEndMins = currentMinutes + 10;
            const breakEndH = Math.floor(breakEndMins / 60);
            const breakEndM = breakEndMins % 60;

            items.push({
              id: `break_${i}`,
              title: 'Brain Break & Hydration',
              category: 'Health',
              priority: 'low',
              startTime: `${String(breakStartH).padStart(2, '0')}:${String(breakStartM).padStart(2, '0')}`,
              endTime: `${String(breakEndH).padStart(2, '0')}:${String(breakEndM).padStart(2, '0')}`,
              durationMinutes: 10,
              reason: 'Scheduled rest prevents cognitive fatigue and maintains productivity.',
              isBreak: true,
            });

            currentMinutes += 10;
            totalPlannedMinutes += 10;
          }
        }

        const plan: DailyPlan = {
          date: new Date().toISOString().split('T')[0],
          totalPlannedMinutes,
          availableMinutes,
          summary: `Scheduled ${items.filter((i) => !i.isBreak).length} core task(s) across ${Math.round((totalPlannedMinutes / 60) * 10) / 10} hours with non-overlapping blocks.`,
          items,
          generatedAt: new Date().toISOString(),
        };

        result = plan;
        userMessage = plan.summary;
        break;
      }

      default:
        throw new Error(`Unknown tool: "${toolName}". Supported tools: create_task, list_tasks, complete_task, update_task, get_daily_summary, generate_daily_plan.`);
    }

    // Log the successful activity
    logActivity({
      intent,
      toolName,
      input: args,
      output: (result as Record<string, unknown>) || {},
      status: 'success',
    });

    return {
      success: true,
      toolName,
      data: result,
      userMessage,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    logActivity({
      intent,
      toolName,
      input: args,
      output: { error: errorMsg },
      status: 'error',
    });

    return {
      success: false,
      toolName,
      error: errorMsg,
      userMessage: `Error executing ${toolName}: ${errorMsg}`,
    };
  }
}
