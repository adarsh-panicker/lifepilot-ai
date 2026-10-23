import { NextRequest, NextResponse } from 'next/server';
import { processWithDemoEngine } from '@/lib/ai/demo-engine';
import { processWithBedrock } from '@/lib/ai/bedrock-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];
    const requestedMode = body.mode === 'bedrock' ? 'bedrock' : 'demo';

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    // Protection against excessive length (prompt injection / denial of service)
    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds maximum allowed length of 2000 characters.' },
        { status: 400 }
      );
    }

    if (requestedMode === 'bedrock') {
      try {
        const bedrockResult = await processWithBedrock(message, history);
        return NextResponse.json({
          success: true,
          mode: 'bedrock',
          response: {
            message: bedrockResult.message,
            toolCalls: bedrockResult.toolCalls,
            usage: bedrockResult.usage,
          },
        });
      } catch (bedrockError: unknown) {
        const errorMsg = bedrockError instanceof Error ? bedrockError.message : String(bedrockError);
        // Explicitly return the failure. NEVER silently switch to fake AI responses when in Bedrock mode.
        return NextResponse.json(
          {
            success: false,
            mode: 'bedrock',
            code: 'BEDROCK_FAILED',
            error: errorMsg,
            suggestion: 'Amazon Bedrock request failed. Ensure your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) and Bedrock model access permissions are active, or switch to Demo Mode.',
          },
          { status: 502 }
        );
      }
    }

    // Default: Demo mode
    const demoResult = await processWithDemoEngine(message, history);
    return NextResponse.json({
      success: true,
      mode: 'demo',
      response: {
        message: demoResult.message,
        toolCalls: demoResult.toolCalls,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
