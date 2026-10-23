import { describe, it, expect, beforeEach } from 'vitest';
import { getAllTasks, createTask, updateTask, deleteTask, resetDatabase } from '@/lib/db';

describe('Database and Task CRUD operations', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('should initialize database with initial seed tasks', () => {
    const tasks = getAllTasks();
    expect(tasks.length).toBeGreaterThanOrEqual(5);
    expect(tasks.some((t) => t.title.includes('Alexa+'))).toBe(true);
  });

  it('should create a new task with valid fields', () => {
    const newTask = createTask({
      title: 'Automated test task',
      description: 'Verifying DB insert',
      priority: 'high',
      category: 'Work',
      estimatedMinutes: 45,
    });

    expect(newTask).toBeDefined();
    expect(newTask.id).toMatch(/^task_/);
    expect(newTask.title).toBe('Automated test task');
    expect(newTask.priority).toBe('high');
    expect(newTask.completed).toBe(false);

    const fetched = getAllTasks({ search: 'Automated test task' });
    expect(fetched.length).toBe(1);
    expect(fetched[0].id).toBe(newTask.id);
  });

  it('should update task status and details', () => {
    const created = createTask({
      title: 'Task to update',
      priority: 'low',
    });

    const updated = updateTask(created.id, {
      title: 'Updated task title',
      completed: true,
      priority: 'high',
    });

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe('Updated task title');
    expect(updated?.completed).toBe(true);
    expect(updated?.priority).toBe('high');
    expect(updated?.completedAt).not.toBeNull();
  });

  it('should delete a task', () => {
    const created = createTask({
      title: 'Task to delete',
    });

    const deleted = deleteTask(created.id);
    expect(deleted).toBe(true);

    const fetched = getAllTasks({ search: 'Task to delete' });
    expect(fetched.length).toBe(0);
  });

  it('should filter tasks by status', () => {
    const pendingTasks = getAllTasks({ status: 'pending' });
    expect(pendingTasks.every((t) => !t.completed)).toBe(true);

    const completedTasks = getAllTasks({ status: 'completed' });
    expect(completedTasks.every((t) => t.completed)).toBe(true);
  });
});
