import { Task } from './types';

// Helper to get an ISO date relative to today (e.g. offsetDays = 0 for today, 1 for tomorrow, -1 for yesterday)
export function getRelativeDate(offsetDays: number, hour: number = 18, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function getInitialSeedTasks(): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      title: 'Complete project report for Alexa+ Hackathon',
      description: 'Draft the final architectural overview, benchmark data, and submission summary.',
      priority: 'high',
      category: 'Work',
      dueDate: getRelativeDate(0, 20, 0), // Today at 8:00 PM
      estimatedMinutes: 90,
      completed: false,
      completedAt: null,
    },
    {
      title: 'Study for cloud architecture examination',
      description: 'Review AWS Bedrock Converse API, IAM security best practices, and serverless concepts.',
      priority: 'high',
      category: 'Study',
      dueDate: getRelativeDate(1, 14, 0), // Tomorrow at 2:00 PM
      estimatedMinutes: 120,
      completed: false,
      completedAt: null,
    },
    {
      title: 'Reply to client and stakeholder emails',
      description: 'Send weekly sprint progress update and confirm Q4 milestone targets.',
      priority: 'medium',
      category: 'Work',
      dueDate: getRelativeDate(0, 17, 0), // Today at 5:00 PM
      estimatedMinutes: 30,
      completed: true,
      completedAt: getRelativeDate(0, 11, 30),
    },
    {
      title: 'Cardio workout and stretching',
      description: '30-minute high-intensity cardio session followed by 10 minutes of mobility exercises.',
      priority: 'medium',
      category: 'Health',
      dueDate: getRelativeDate(0, 19, 0), // Today at 7:00 PM
      estimatedMinutes: 40,
      completed: false,
      completedAt: null,
    },
    {
      title: 'Read chapter 4 of Designing Data-Intensive Applications',
      description: 'Focus on encoding and evolution formats (Avro, Protocol Buffers, and JSON schema).',
      priority: 'low',
      category: 'Personal',
      dueDate: getRelativeDate(2, 21, 0), // In 2 days
      estimatedMinutes: 45,
      completed: false,
      completedAt: null,
    },
    {
      title: 'Prepare demo script and voice commands',
      description: 'Outline the 2-minute 45-second walkthrough demonstrating natural language tool invocation.',
      priority: 'high',
      category: 'Work',
      dueDate: getRelativeDate(0, 21, 30), // Today at 9:30 PM
      estimatedMinutes: 45,
      completed: false,
      completedAt: null,
    },
  ];
}
