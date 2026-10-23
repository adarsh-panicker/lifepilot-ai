import { NextResponse } from 'next/server';
import { checkBedrockStatus, getBedrockConfig } from '@/lib/ai/bedrock-client';

export async function GET() {
  try {
    const config = getBedrockConfig();
    const status = await checkBedrockStatus();

    return NextResponse.json({
      success: true,
      config: {
        region: config.region,
        modelId: config.modelId,
        hasAccessKey: config.hasAccessKey,
      },
      status,
    });
  } catch (err: unknown) {
    const config = getBedrockConfig();
    return NextResponse.json({
      success: false,
      config: {
        region: config.region,
        modelId: config.modelId,
        hasAccessKey: config.hasAccessKey,
      },
      status: {
        configured: false,
        region: config.region,
        modelId: config.modelId,
        hasCredentials: config.hasAccessKey,
        error: err instanceof Error ? err.message : String(err),
      },
    });
  }
}
