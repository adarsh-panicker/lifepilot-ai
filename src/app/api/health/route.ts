import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getBedrockConfig } from '@/lib/ai/bedrock-client';

export async function GET() {
  try {
    const db = getDb();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    const bedrockConfig = getBedrockConfig();

    return NextResponse.json({
      status: 'healthy',
      application: 'LifePilot AI',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        taskCount: countRow.count,
      },
      bedrock: {
        region: bedrockConfig.region,
        modelId: bedrockConfig.modelId,
        hasAccessKey: bedrockConfig.hasAccessKey,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
