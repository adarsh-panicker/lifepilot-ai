import { executeTool, ToolExecutionResult } from '../tools/executor';
import { ToolCallRecord, DailyPlan } from '../types';

export interface DemoEngineResponse {
  message: string;
  toolCalls: ToolCallRecord[];
}

export async function processWithDemoEngine(
  userQuery: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  history: Array<{ role: string; content: string }> = []
): Promise<DemoEngineResponse> {
  const query = userQuery.toLowerCase().trim();
  const toolCalls: ToolCallRecord[] = [];

  // 1. Task Creation Intents
  // e.g.: "add a task to finish my project by 8 PM", "create task study for exam", "add task: buy groceries"
  if (
    query.startsWith('add a task') ||
    query.startsWith('add task') ||
    query.startsWith('create a task') ||
    query.startsWith('create task') ||
    query.startsWith('remind me to') ||
    query.includes('new task')
  ) {
    // Extract task title
    let title = userQuery
      .replace(/^(add a task to|add task to|add a task|add task|create a task to|create task to|create a task|create task|remind me to|new task:?)\s*/i, '')
      .trim();

    let priority: 'high' | 'medium' | 'low' = 'medium';
    let estimatedMinutes = 45;
    let category: 'Work' | 'Study' | 'Health' | 'Personal' | 'Other' = 'Work';

    if (query.includes('high priority') || query.includes('urgent') || query.includes('asap') || query.includes('important')) {
      priority = 'high';
      title = title.replace(/\b(high priority|urgent|asap|important)\b/gi, '').trim();
    } else if (query.includes('low priority')) {
      priority = 'low';
      title = title.replace(/\blow priority\b/gi, '').trim();
    }

    if (query.includes('study') || query.includes('exam') || query.includes('assignment') || query.includes('read') || query.includes('course')) {
      category = 'Study';
    } else if (query.includes('workout') || query.includes('exercise') || query.includes('walk') || query.includes('gym')) {
      category = 'Health';
    } else if (query.includes('groceries') || query.includes('call') || query.includes('clean')) {
      category = 'Personal';
    }

    // Time estimate extract (e.g., 30 minutes, 2 hours)
    const minMatch = query.match(/(\d+)\s*(min|minute|minutes)/);
    const hourMatch = query.match(/(\d+)\s*(hr|hour|hours)/);
    if (minMatch) {
      estimatedMinutes = parseInt(minMatch[1], 10);
    } else if (hourMatch) {
      estimatedMinutes = parseInt(hourMatch[1], 10) * 60;
    }

    // Clean up title
    title = title.replace(/\s+with\s+(high|medium|low)\s+priority/i, '');
    title = title.replace(/\s+in\s+\d+\s*(minutes|mins|hours|hrs)/i, '');
    title = title.replace(/\s*by\s+\d+(\s*(am|pm))?/i, '');
    title = title.replace(/[.,;]$/, '').trim();

    if (!title) {
      title = 'Follow up on priorities';
    }

    const args = {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      priority,
      category,
      estimatedMinutes,
    };

    const execResult = await executeTool('create_task', args, userQuery);

    toolCalls.push({
      toolName: 'create_task',
      input: args,
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    const reply = execResult.success
      ? `I've created that task for you: "${args.title}" categorized under ${category} with ${priority.toUpperCase()} priority (${estimatedMinutes} minutes). It is now scheduled in your task dashboard.`
      : `I attempted to create the task, but ran into an issue: ${execResult.error}`;

    return { message: reply, toolCalls };
  }

  // 2. Planning Day / Study Plan / Time Allocation
  // e.g.: "plan my day", "create a study plan for the next three hours", "i have only 30 minutes"
  if (
    query.includes('plan my day') ||
    query.includes('daily plan') ||
    query.includes('schedule') ||
    query.includes('study plan') ||
    query.includes('30 minutes') ||
    query.includes('three hours') ||
    query.includes('hours')
  ) {
    let availableHours = 6;
    let focusArea = 'general';

    if (query.includes('30 minutes') || query.includes('half hour')) {
      availableHours = 0.5;
      focusArea = 'quick progress';
    } else if (query.includes('three hours') || query.includes('3 hours')) {
      availableHours = 3;
      focusArea = 'study';
    } else if (query.includes('2 hours') || query.includes('two hours')) {
      availableHours = 2;
    } else if (query.includes('4 hours') || query.includes('four hours')) {
      availableHours = 4;
    }

    const currentHour = new Date().getHours();
    const startHour = Math.max(8, Math.min(currentHour, 19));

    const args = {
      availableHours,
      startHour,
      focusArea,
    };

    const execResult = await executeTool('generate_daily_plan', args, userQuery);

    toolCalls.push({
      toolName: 'generate_daily_plan',
      input: args,
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    if (execResult.success && execResult.data) {
      const plan = execResult.data as DailyPlan;
      const taskItems = plan.items.filter((i) => !i.isBreak);

      let msg = `Here is your optimized plan for the next ${availableHours === 0.5 ? '30 minutes' : `${availableHours} hours`}:\n\n`;

      if (taskItems.length === 0) {
        msg += `All your scheduled tasks are already complete! You can take a well-deserved break or add new goals.`;
      } else {
        taskItems.forEach((item, idx) => {
          msg += `${idx + 1}. **${item.title}** (${item.startTime} - ${item.endTime}, ${item.durationMinutes}m)\n   *${item.reason}*\n`;
        });
        msg += `\nI have balanced high-priority deadlines first to ensure maximum productivity without cognitive overload.`;
      }

      return { message: msg, toolCalls };
    }

    return {
      message: `I encountered an issue preparing your daily plan: ${execResult.error}`,
      toolCalls,
    };
  }

  // 3. What to focus on / Prioritization
  // e.g.: "what should i focus on first?", "what is my top priority?"
  if (
    query.includes('what should i focus on') ||
    query.includes('top priority') ||
    query.includes('focus on first') ||
    query.includes('most urgent')
  ) {
    const args = { status: 'pending', priority: 'high' };
    const execResult = await executeTool('list_tasks', args, userQuery);

    toolCalls.push({
      toolName: 'list_tasks',
      input: args,
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = execResult.data as any;
    if (data?.tasks && data.tasks.length > 0) {
      const topTask = data.tasks[0];
      const otherHigh = data.tasks.slice(1);

      let msg = `You should focus first on: **${topTask.title}** (${topTask.estimatedMinutes}m, ${topTask.category}).\n\n`;
      msg += `This is marked as HIGH priority and has the earliest upcoming deadline. Dedicate your immediate uninterrupted attention to it.`;

      if (otherHigh.length > 0) {
        msg += `\n\nAfter that, your next priority is: **${otherHigh[0].title}**.`;
      }
      return { message: msg, toolCalls };
    } else {
      // Check all pending
      const allPending = await executeTool('list_tasks', { status: 'pending' }, userQuery);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pendingData = allPending.data as any;
      if (pendingData?.tasks?.length > 0) {
        const first = pendingData.tasks[0];
        return {
          message: `You don't have any outstanding high-priority tasks. The next item in your queue is **${first.title}** (${first.estimatedMinutes}m, ${first.priority} priority).`,
          toolCalls,
        };
      }
      return {
        message: `Your task queue is completely clear! There are no pending tasks requiring your attention right now.`,
        toolCalls,
      };
    }
  }

  // 4. Summarize pending tasks / Daily Summary
  // e.g.: "summarize my pending tasks", "give me a summary", "how am i doing today"
  if (
    query.includes('summarize') ||
    query.includes('summary') ||
    query.includes('status report') ||
    query.includes('overview')
  ) {
    const execResult = await executeTool('get_daily_summary', {}, userQuery);

    toolCalls.push({
      toolName: 'get_daily_summary',
      input: {},
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = execResult.data as any;
    let msg = `Here is your productivity summary:\n\n`;
    msg += `- **Total Tasks:** ${s.totalTasks}\n`;
    msg += `- **Completed:** ${s.completedTasks} (${s.completionRate}% completion rate)\n`;
    msg += `- **Pending:** ${s.pendingTasks} tasks (~${Math.round(s.totalEstimatedMinutes / 60)}h ${s.totalEstimatedMinutes % 60}m remaining)\n`;
    msg += `- **Overdue:** ${s.overdueTasks > 0 ? `⚠️ ${s.overdueTasks} task(s) overdue` : '✅ None'}\n\n`;
    msg += `**Priority Breakdown:** ${s.priorityBreakdown.high} High, ${s.priorityBreakdown.medium} Medium, ${s.priorityBreakdown.low} Low.\n\n`;
    if (s.insights && s.insights.length > 0) {
      msg += `💡 *${s.insights[0]}*`;
    }

    return { message: msg, toolCalls };
  }

  // 5. Complete / Done Task
  // e.g.: "mark task as complete", "complete task reply to emails", "i finished studying"
  if (
    query.startsWith('complete task') ||
    query.startsWith('finish task') ||
    query.startsWith('mark task') ||
    query.includes('mark complete') ||
    query.includes('i finished')
  ) {
    const titleQuery = query
      .replace(/^(complete task|finish task|mark task|mark complete|i finished)\s*/i, '')
      .replace(/\s*(as complete|as done|completed|done)$/i, '')
      .trim();

    const args = { titleQuery };
    const execResult = await executeTool('complete_task', args, userQuery);

    toolCalls.push({
      toolName: 'complete_task',
      input: args,
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    if (execResult.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completedTask = execResult.data as any;
      return {
        message: `Great job! I've marked "**${completedTask.title}**" as complete. Your daily progress has been updated.`,
        toolCalls,
      };
    } else {
      return {
        message: `I couldn't find a pending task matching "${titleQuery}". Could you specify the exact task title or ID?`,
        toolCalls,
      };
    }
  }

  // 6. List / Show tasks
  // e.g.: "list my tasks", "show pending tasks", "what are my tasks"
  if (
    query.includes('list') ||
    query.includes('show tasks') ||
    query.includes('what are my tasks') ||
    query.includes('my tasks')
  ) {
    const status = query.includes('completed') ? 'completed' : 'pending';
    const args = { status };
    const execResult = await executeTool('list_tasks', args, userQuery);

    toolCalls.push({
      toolName: 'list_tasks',
      input: args,
      output: (execResult.data as Record<string, unknown>) || {},
      status: execResult.success ? 'success' : 'error',
      errorMessage: execResult.error,
      timestamp: new Date().toISOString(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = execResult.data as any;
    if (!data?.tasks || data.tasks.length === 0) {
      return {
        message: `You have no ${status} tasks at the moment.`,
        toolCalls,
      };
    }

    let msg = `Here are your ${status} tasks (${data.tasks.length}):\n\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.tasks.forEach((t: any, i: number) => {
      msg += `${i + 1}. **${t.title}** [${t.priority.toUpperCase()}] — ~${t.estimatedMinutes}m (${t.category})\n`;
    });

    return { message: msg, toolCalls };
  }

  // Default fallback conversational reply
  return {
    message: `I'm LifePilot, your personal productivity assistant. I can help you organize tasks, build focused daily schedules, prioritize what matters most, or summarize your workload.\n\nTry asking me:\n- *"Plan my day. I have an assignment due tonight."*\n- *"What should I focus on first?"*\n- *"Add a task to finish my project report by 8 PM."*\n- *"Summarize my pending tasks."*`,
    toolCalls: [],
  };
}
