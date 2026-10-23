import { NextResponse } from 'next/server';
import { resetDatabase, getAllTasks } from '@/lib/db';

export async function POST() {
  try {
    resetDatabase();
    const tasks = getAllTasks();
    return NextResponse.json({
      success: true,
      message: 'Database reset and seeded with realistic relative demo tasks successfully.',
      count: tasks.length,
      tasks,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
