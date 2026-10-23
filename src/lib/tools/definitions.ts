/**
 * Amazon Bedrock Converse API Tool Specifications
 * LifePilot AI structured tool definitions
 */

export const BEDROCK_TOOLS = [
  {
    toolSpec: {
      name: 'create_task',
      description: 'Creates a new productivity task with title, optional description, priority, category, due date, and estimated duration in minutes.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title or name of the task (e.g., "Complete physics assignment", "Finish project report")',
            },
            description: {
              type: 'string',
              description: 'Additional context, details, or checklist items for the task.',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Priority level of the task. Defaults to "medium" if unspecified.',
            },
            category: {
              type: 'string',
              enum: ['Work', 'Study', 'Health', 'Personal', 'Other'],
              description: 'Category grouping. Defaults to "Work" or "Study".',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in ISO format or timestamp (e.g. YYYY-MM-DD or YYYY-MM-DDTHH:mm).',
            },
            estimatedMinutes: {
              type: 'integer',
              description: 'Estimated time in minutes to complete this task (e.g. 30, 45, 60, 90).',
            },
          },
          required: ['title'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'list_tasks',
      description: 'Lists tasks from the persistent database with optional filters for status (pending/completed/all), priority, or search term.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['all', 'pending', 'completed'],
              description: 'Filter by task completion status. Defaults to "pending".',
            },
            priority: {
              type: 'string',
              enum: ['all', 'high', 'medium', 'low'],
              description: 'Optional filter by priority level.',
            },
            category: {
              type: 'string',
              description: 'Optional filter by category.',
            },
            search: {
              type: 'string',
              description: 'Search string to filter task titles and descriptions.',
            },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'complete_task',
      description: 'Marks an existing task as completed in the database. Can find the task by exact ID or by title matching.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The unique ID of the task to mark completed (e.g. "task_1729700000_1").',
            },
            titleQuery: {
              type: 'string',
              description: 'If the ID is unknown, the title or keywords of the task to complete.',
            },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'update_task',
      description: 'Updates details of an existing task such as title, priority, due date, estimated minutes, or description.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The unique ID of the task to update.',
            },
            title: {
              type: 'string',
              description: 'Updated title.',
            },
            description: {
              type: 'string',
              description: 'Updated description.',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Updated priority.',
            },
            dueDate: {
              type: 'string',
              description: 'Updated due date.',
            },
            estimatedMinutes: {
              type: 'integer',
              description: 'Updated estimated duration in minutes.',
            },
          },
          required: ['id'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'delete_task',
      description: 'Deletes an existing task from the persistent database by ID or title.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The unique ID of the task to delete.',
            },
            titleQuery: {
              type: 'string',
              description: 'The title or keywords of the task to delete if ID is unknown.',
            },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_daily_summary',
      description: 'Retrieves an analytical summary of the user\'s tasks: total tasks, completed, pending, overdue, and upcoming priorities.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {},
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'generate_daily_plan',
      description: 'Generates a non-overlapping, prioritized time-blocked daily schedule based on pending tasks, deadlines, and available working hours.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            availableHours: {
              type: 'number',
              description: 'Available working or study hours for the day (e.g. 3, 4, 6, 8). Defaults to 6.',
            },
            startHour: {
              type: 'integer',
              description: 'Hour of the day to start scheduling (e.g., 9 for 09:00 AM, 14 for 2:00 PM). Defaults to current hour or 9.',
            },
            focusArea: {
              type: 'string',
              description: 'Optional focus area such as "urgent tasks", "exam prep", "assignment".',
            },
          },
        },
      },
    },
  },
];
