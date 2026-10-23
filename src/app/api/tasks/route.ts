import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/lib/db';
import { CreateTaskInput } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'all' | 'pending' | 'completed' | null;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const tasks = getAllTasks({
      status: status || undefined,
      priority,
      category,
      search,
    });

    return NextResponse.json({ success: true, tasks, count: tasks.length });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTaskInput;

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Task title is required.' },
        { status: 400 }
      );
    }

    const task = createTask(body);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
