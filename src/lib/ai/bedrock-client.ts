import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
  ToolConfiguration,
  ToolResultBlock,
} from '@aws-sdk/client-bedrock-runtime';
import { BEDROCK_TOOLS } from '../tools/definitions';
import { executeTool } from '../tools/executor';
import { ToolCallRecord } from '../types';

export interface BedrockResponse {
  message: string;
  toolCalls: ToolCallRecord[];
  stopReason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface BedrockStatus {
  configured: boolean;
  region: string;
  modelId: string;
  hasCredentials: boolean;
  error?: string;
}

export function getBedrockConfig() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0';
  const hasAccessKey = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  return {
    region,
    modelId,
    hasAccessKey,
  };
}

let cachedClient: BedrockRuntimeClient | null = null;

function getClient(region: string): BedrockRuntimeClient {
  if (!cachedClient) {
    cachedClient = new BedrockRuntimeClient({
      region,
      // The SDK automatically falls back to AWS credential chain:
      // env vars -> ~/.aws/credentials -> IAM ECS/EC2 role
    });
  }
  return cachedClient;
}

export async function checkBedrockStatus(): Promise<BedrockStatus> {
  const { region, modelId, hasAccessKey } = getBedrockConfig();

  // If no credentials are found in env vars, note this
  if (!hasAccessKey && !process.env.AWS_PROFILE && !process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
    return {
      configured: false,
      region,
      modelId,
      hasCredentials: false,
      error: 'AWS credentials not detected in environment. To use real Bedrock mode, configure AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY or an IAM profile.',
    };
  }

  try {
    const client = getClient(region);
    // Send a lightweight ping to verify authentication & model access
    const command = new ConverseCommand({
      modelId,
      messages: [
        {
          role: 'user',
          content: [{ text: 'Ping' }],
        },
      ],
      inferenceConfig: {
        maxTokens: 5,
        temperature: 0.1,
      },
    });

    await client.send(command);
    return {
      configured: true,
      region,
      modelId,
      hasCredentials: true,
    };
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as any;
    const errorMsg = anyErr?.message || String(err);
    return {
      configured: false,
      region,
      modelId,
      hasCredentials: hasAccessKey,
      error: `Bedrock connection failed: ${errorMsg}`,
    };
  }
}

export async function processWithBedrock(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<BedrockResponse> {
  const { region, modelId } = getBedrockConfig();
  const client = getClient(region);

  const systemPrompt = [
    {
      text: `You are LifePilot AI, a proactive, intelligent personal productivity assistant inspired by the Alexa+ experience.
You help users plan their daily schedules, manage tasks, prioritize their time, and make concrete progress.

Guidelines:
- When the user asks to create, list, complete, update, summarize, or plan tasks, USE THE PROVIDED TOOLS.
- Always execute tool calls to inspect or modify the database rather than making assumptions.
- Explain scheduling decisions logically (e.g. why a high priority task was placed first).
- Never claim a task was completed unless complete_task succeeds.
- Keep conversational replies clear, encouraging, concise, and structured.
- Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
    },
  ];

  const toolConfig: ToolConfiguration = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: BEDROCK_TOOLS as any,
  };

  // Build message history conforming to Bedrock Converse requirements:
  // 1. Must start with a 'user' message.
  // 2. Must alternate between user and assistant.
  const converseMessages: Message[] = [];

  const rawHistory = history.slice(-6).filter((h) => h.content && h.content.trim());
  const firstUserIdx = rawHistory.findIndex((h) => h.role === 'user');
  const validHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

  for (const h of validHistory) {
    const role = h.role === 'user' ? 'user' : 'assistant';
    const lastMsg = converseMessages[converseMessages.length - 1];
    if (lastMsg && lastMsg.role === role) {
      lastMsg.content = [...(lastMsg.content || []), { text: `\n${h.content}` }];
    } else {
      converseMessages.push({
        role,
        content: [{ text: h.content }],
      });
    }
  }

  const lastMsg = converseMessages[converseMessages.length - 1];
  if (lastMsg && lastMsg.role === 'user') {
    lastMsg.content = [...(lastMsg.content || []), { text: `\n${userQuery}` }];
  } else {
    converseMessages.push({
      role: 'user',
      content: [{ text: userQuery }],
    });
  }

  const toolCalls: ToolCallRecord[] = [];

  try {
    // First round of Converse
    let command = new ConverseCommand({
      modelId,
      system: systemPrompt,
      messages: converseMessages,
      toolConfig,
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.2,
      },
    });

    let response = await client.send(command);
    let outputMessage = response.output?.message;

    // Check if model wants to call tools
    while (response.stopReason === 'tool_use' && outputMessage) {
      converseMessages.push(outputMessage);

      const toolResults: ToolResultBlock[] = [];

      for (const contentBlock of outputMessage.content || []) {
        if (contentBlock.toolUse) {
          const { toolUseId, name, input } = contentBlock.toolUse;
          const toolInput = (input || {}) as Record<string, unknown>;

          // Execute tool on server
          const execResult = await executeTool(name || '', toolInput, userQuery);

          toolCalls.push({
            toolName: name || 'unknown',
            toolUseId: toolUseId || '',
            input: toolInput,
            output: (execResult.data as Record<string, unknown>) || {},
            status: execResult.success ? 'success' : 'error',
            errorMessage: execResult.error,
            timestamp: new Date().toISOString(),
          });

          toolResults.push({
            toolUseId: toolUseId || '',
            content: [
              {
                json: {
                  success: execResult.success,
                  data: execResult.data as Record<string, unknown>,
                  error: execResult.error,
                } as any,
              },
            ],
            status: execResult.success ? 'success' : 'error',
          });
        }
      }

      // Send tool results back to Bedrock for final synthesis
      converseMessages.push({
        role: 'user',
        content: toolResults.map((tr) => ({ toolResult: tr })),
      });

      command = new ConverseCommand({
        modelId,
        system: systemPrompt,
        messages: converseMessages,
        toolConfig,
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.2,
        },
      });

      response = await client.send(command);
      outputMessage = response.output?.message;
    }

    // Extract final assistant message text
    let responseText = '';
    for (const block of outputMessage?.content || []) {
      if (block.text) {
        responseText += block.text;
      }
    }

    return {
      message: responseText || 'Action completed successfully.',
      toolCalls,
      stopReason: response.stopReason,
      usage: {
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
        totalTokens: response.usage?.totalTokens,
      },
    };
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as any;
    const errorName = anyErr?.name || 'BedrockError';
    const errorMessage = anyErr?.message || String(err);

    throw new Error(`[Bedrock ${errorName}] ${errorMessage}`);
  }
}
