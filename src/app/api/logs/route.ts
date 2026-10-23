import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const logs = getActivityLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
