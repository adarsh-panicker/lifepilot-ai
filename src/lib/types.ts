export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Work' | 'Study' | 'Health' | 'Personal' | 'Other';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string; // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category?: TaskCategory;
  dueDate?: string;
  estimatedMinutes?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  category?: TaskCategory;
  dueDate?: string;
  estimatedMinutes?: number;
  completed?: boolean;
}

export interface ToolCallRecord {
  toolName: string;
  toolUseId?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'executing' | 'success' | 'error';
  errorMessage?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallRecord[];
  mode?: 'demo' | 'bedrock';
}

export interface DailyPlanItem {
  id: string;
  taskId?: string;
  title: string;
  category: TaskCategory;
  priority: Priority;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number;
  reason: string;
  isBreak?: boolean;
}

export interface DailyPlan {
  date: string;
  totalPlannedMinutes: number;
  availableMinutes: number;
  summary: string;
  items: DailyPlanItem[];
  generatedAt: string;
}

export interface ProductivityInsights {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number; // 0-100
  totalEstimatedMinutes: number;
  completedMinutes: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: Record<string, number>;
  insights: string[];
}
