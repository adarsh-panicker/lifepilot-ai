import { describe, it, expect, beforeEach } from 'vitest';
import { processWithDemoEngine } from '@/lib/ai/demo-engine';
import { resetDatabase } from '@/lib/db';

describe('Demo Mode Engine', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('should interpret task creation and invoke create_task', async () => {
    const res = await processWithDemoEngine('Add a task to submit the hackathon project report by 8 PM with high priority');
    expect(res.toolCalls.length).toBe(1);
    expect(res.toolCalls[0].toolName).toBe('create_task');
    expect(res.toolCalls[0].status).toBe('success');
    expect(res.message).toContain('created');
  });

  it('should interpret daily planning query and invoke generate_daily_plan', async () => {
    const res = await processWithDemoEngine('Plan my day. I have an assignment due tonight.');
    expect(res.toolCalls.length).toBe(1);
    expect(res.toolCalls[0].toolName).toBe('generate_daily_plan');
    expect(res.toolCalls[0].status).toBe('success');
    expect(res.message).toContain('optimized plan');
  });

  it('should interpret prioritization query and invoke list_tasks', async () => {
    const res = await processWithDemoEngine('What should I focus on first?');
    expect(res.toolCalls.length).toBeGreaterThanOrEqual(1);
    expect(res.toolCalls[0].toolName).toBe('list_tasks');
    expect(res.message).toContain('focus');
  });

  it('should interpret summary query and invoke get_daily_summary', async () => {
    const res = await processWithDemoEngine('Summarize my pending tasks and suggest a realistic plan.');
    expect(res.toolCalls.length).toBe(1);
    expect(res.toolCalls[0].toolName).toBe('get_daily_summary');
    expect(res.message).toContain('productivity summary');
  });

  it('should interpret short duration availability', async () => {
    const res = await processWithDemoEngine('I have only 30 minutes. Help me make progress.');
    expect(res.toolCalls.length).toBe(1);
    expect(res.toolCalls[0].toolName).toBe('generate_daily_plan');
    expect(res.message).toContain('30 minutes');
  });
});
