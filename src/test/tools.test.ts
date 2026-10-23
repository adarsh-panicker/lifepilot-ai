import { describe, it, expect, beforeEach } from 'vitest';
import { executeTool } from '@/lib/tools/executor';
import { resetDatabase, getAllTasks } from '@/lib/db';

describe('LifePilot Application Tools', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('create_task should validate input and insert a new task', async () => {
    const res = await executeTool('create_task', {
      title: 'Review PR for Bedrock integration',
      priority: 'high',
      category: 'Work',
      estimatedMinutes: 60,
    });

    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = res.data as any;
    expect(task.title).toBe('Review PR for Bedrock integration');
    expect(task.priority).toBe('high');
    expect(task.estimatedMinutes).toBe(60);
  });

  it('create_task should reject empty title', async () => {
    const res = await executeTool('create_task', {
      title: '   ',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('cannot be empty');
  });

  it('list_tasks should return filtered tasks', async () => {
    const res = await executeTool('list_tasks', { status: 'pending' });
    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    expect(data.tasks.length).toBeGreaterThan(0);
    expect(data.count).toBe(data.tasks.length);
  });

  it('complete_task should mark task as completed by title query', async () => {
    const pending = getAllTasks({ status: 'pending' });
    const targetTask = pending[0];

    const res = await executeTool('complete_task', {
      titleQuery: targetTask.title,
    });

    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = res.data as any;
    expect(updated.id).toBe(targetTask.id);
    expect(updated.completed).toBe(true);
  });

  it('get_daily_summary should return realistic analytics and insights', async () => {
    const res = await executeTool('get_daily_summary', {});
    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = res.data as any;
    expect(summary.totalTasks).toBeGreaterThan(0);
    expect(typeof summary.completionRate).toBe('number');
    expect(summary.insights.length).toBeGreaterThan(0);
  });

  it('generate_daily_plan should generate non-overlapping schedule items', async () => {
    const res = await executeTool('generate_daily_plan', {
      availableHours: 4,
      startHour: 9,
    });

    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plan = res.data as any;
    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.availableMinutes).toBe(240);
    expect(plan.totalPlannedMinutes).toBeLessThanOrEqual(240);

    // Verify non-overlapping time sequence
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plan.items.forEach((item: any) => {
      expect(item.startTime).toBeDefined();
      expect(item.endTime).toBeDefined();
      expect(item.reason).toBeDefined();
    });
  });

  it('delete_task should remove task by ID', async () => {
    const tasks = getAllTasks();
    const target = tasks[0];

    const res = await executeTool('delete_task', { id: target.id });
    expect(res.success).toBe(true);

    const remaining = getAllTasks();
    expect(remaining.some((t) => t.id === target.id)).toBe(false);
  });

  it('generate_daily_plan should prioritize study tasks when focusArea is study', async () => {
    const res = await executeTool('generate_daily_plan', {
      availableHours: 3,
      startHour: 10,
      focusArea: 'study',
    });

    expect(res.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plan = res.data as any;
    expect(plan.items.length).toBeGreaterThan(0);
    // First non-break item should be study if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nonBreak = plan.items.filter((i: any) => !i.isBreak);
    expect(nonBreak[0].category).toBe('Study');
  });

  it('should reject unknown tool gracefully', async () => {
    const res = await executeTool('unauthorized_shell_exec', { command: 'rm -rf /' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Unknown tool');
  });
});
