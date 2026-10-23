import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Task, CreateTaskInput, UpdateTaskInput } from './types';
import { getInitialSeedTasks } from './seed-data';

let dbInstance: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.cwd(), process.env.DATABASE_PATH);
  }
  const dir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'lifepilot.db');
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'Work',
      due_date TEXT NOT NULL,
      estimated_minutes INTEGER NOT NULL DEFAULT 30,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Activity logs table for Alexa+ simulated audit trail
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      intent TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      input_data TEXT NOT NULL,
      output_data TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Check if tasks table is empty, if so, populate initial seed data
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db);
  }
}

function seedDatabase(db: Database.Database) {
  const seedTasks = getInitialSeedTasks();
  const insertStmt = db.prepare(`
    INSERT INTO tasks (
      id, title, description, priority, category,
      due_date, estimated_minutes, completed, completed_at, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @priority, @category,
      @dueDate, @estimatedMinutes, @completed, @completedAt, @createdAt, @updatedAt
    )
  `);

  const now = new Date().toISOString();
  const seedPrefix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const insertMany = db.transaction((tasks) => {
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      insertStmt.run({
        id: `seed_${seedPrefix}_${i + 1}`,
        title: t.title,
        description: t.description || '',
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes,
        completed: t.completed ? 1 : 0,
        completedAt: t.completedAt || null,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  insertMany(seedTasks);
}

// Convert DB row to Task object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date,
    estimatedMinutes: row.estimated_minutes,
    completed: Boolean(row.completed),
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllTasks(filters?: {
  status?: 'all' | 'pending' | 'completed';
  priority?: string;
  category?: string;
  search?: string;
}): Task[] {
  const db = getDb();
  let query = 'SELECT * FROM tasks WHERE 1=1';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];

  if (filters?.status === 'pending') {
    query += ' AND completed = 0';
  } else if (filters?.status === 'completed') {
    query += ' AND completed = 1';
  }

  if (filters?.priority && filters.priority !== 'all') {
    query += ' AND priority = ?';
    params.push(filters.priority.toLowerCase());
  }

  if (filters?.category && filters.category !== 'all') {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.search && filters.search.trim()) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY completed ASC, due_date ASC';

  const rows = db.prepare(query).all(...params);
  return rows.map(rowToTask);
}

export function getTaskById(id: string): Task | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) return null;
  return rowToTask(row);
}

export function createTask(input: CreateTaskInput): Task {
  const db = getDb();
  const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  // Default due date to today end of day if missing
  let dueDate = input.dueDate;
  if (!dueDate) {
    const endOfDay = new Date();
    endOfDay.setHours(20, 0, 0, 0);
    dueDate = endOfDay.toISOString();
  }

  const task: Task = {
    id,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    priority: input.priority || 'medium',
    category: input.category || 'Work',
    dueDate,
    estimatedMinutes: input.estimatedMinutes && input.estimatedMinutes > 0 ? input.estimatedMinutes : 30,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO tasks (
      id, title, description, priority, category,
      due_date, estimated_minutes, completed, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
  `).run(
    task.id,
    task.title,
    task.description,
    task.priority,
    task.category,
    task.dueDate,
    task.estimatedMinutes,
    task.createdAt,
    task.updatedAt
  );

  return task;
}

export function updateTask(id: string, input: UpdateTaskInput): Task | null {
  const db = getDb();
  const existing = getTaskById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  let completed = existing.completed;
  let completedAt = existing.completedAt;

  if (input.completed !== undefined) {
    completed = input.completed;
    completedAt = input.completed ? (existing.completedAt || now) : null;
  }

  const updated: Task = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    priority: input.priority !== undefined ? input.priority : existing.priority,
    category: input.category !== undefined ? input.category : existing.category,
    dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    estimatedMinutes: input.estimatedMinutes !== undefined ? input.estimatedMinutes : existing.estimatedMinutes,
    completed,
    completedAt,
    updatedAt: now,
  };

  db.prepare(`
    UPDATE tasks SET
      title = ?,
      description = ?,
      priority = ?,
      category = ?,
      due_date = ?,
      estimated_minutes = ?,
      completed = ?,
      completed_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.description,
    updated.priority,
    updated.category,
    updated.dueDate,
    updated.estimatedMinutes,
    updated.completed ? 1 : 0,
    updated.completedAt,
    updated.updatedAt,
    id
  );

  return updated;
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return res.changes > 0;
}

export function resetDatabase(): void {
  const db = getDb();
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM activity_logs');
  seedDatabase(db);
}

export function logActivity(log: {
  intent: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: string;
}) {
  const db = getDb();
  const id = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO activity_logs (id, intent, tool_name, input_data, output_data, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    log.intent,
    log.toolName,
    JSON.stringify(log.input),
    JSON.stringify(log.output),
    log.status,
    now
  );
}

export function getActivityLogs(limit = 20) {
  const db = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
  return rows.map((r) => ({
    id: r.id,
    intent: r.intent,
    toolName: r.tool_name,
    input: JSON.parse(r.input_data || '{}'),
    output: JSON.parse(r.output_data || '{}'),
    status: r.status,
    createdAt: r.created_at,
  }));
}
