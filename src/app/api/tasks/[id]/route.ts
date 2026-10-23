import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/db';
import { UpdateTaskInput } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as UpdateTaskInput;
    const task = updateTask(params.id, body);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteTask(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
