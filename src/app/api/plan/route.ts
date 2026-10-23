import { NextRequest, NextResponse } from 'next/server';
import { executeTool } from '@/lib/tools/executor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const availableHours = typeof body.availableHours === 'number' ? body.availableHours : 6;
    const startHour = typeof body.startHour === 'number' ? body.startHour : 9;
    const focusArea = body.focusArea || 'general';

    const result = await executeTool(
      'generate_daily_plan',
      { availableHours, startHour, focusArea },
      'Direct schedule generation'
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, plan: result.data });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
