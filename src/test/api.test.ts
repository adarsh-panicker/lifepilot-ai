import { describe, it, expect } from 'vitest';
import { GET as healthGet } from '@/app/api/health/route';
import { POST as chatPost } from '@/app/api/chat/route';
import { GET as tasksGet, POST as tasksPost } from '@/app/api/tasks/route';
import { POST as seedPost } from '@/app/api/seed/route';
import { NextRequest } from 'next/server';

describe('LifePilot AI Route Handlers', () => {
  it('GET /api/health should return healthy status and database metrics', async () => {
    const res = await healthGet();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.application).toBe('LifePilot AI');
    expect(json.database.connected).toBe(true);
    expect(json.bedrock.modelId).toBeDefined();
  });

  it('POST /api/chat in demo mode should handle user query and execute tools', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Plan my day. I have an assignment due tonight.',
        mode: 'demo',
      }),
    });

    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.mode).toBe('demo');
    expect(json.response.message).toBeDefined();
    expect(json.response.toolCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/chat in bedrock mode without AWS credentials should return explicit 502 with helpful suggestion', async () => {
    // Ensuring no AWS credentials in test environment
    const prevKey = process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_ACCESS_KEY_ID;

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Plan my day.',
        mode: 'bedrock',
      }),
    });

    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.success).toBe(false);
    expect(json.code).toBe('BEDROCK_FAILED');
    expect(json.suggestion).toContain('Demo Mode');

    if (prevKey) process.env.AWS_ACCESS_KEY_ID = prevKey;
  });

  it('GET and POST /api/tasks should create and retrieve tasks', async () => {
    const createReq = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Integration Test Task',
        priority: 'high',
        category: 'Study',
        estimatedMinutes: 50,
      }),
    });

    const postRes = await tasksPost(createReq);
    const postJson = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postJson.success).toBe(true);
    expect(postJson.task.title).toBe('Integration Test Task');

    const listReq = new NextRequest('http://localhost:3000/api/tasks?search=Integration+Test+Task');
    const getRes = await tasksGet(listReq);
    const getJson = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getJson.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/seed should reset and restore relative demo tasks', async () => {
    const res = await seedPost();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(5);
  });
});
