'use client';

import React, { useState, useEffect } from 'react';
import { Task, CreateTaskInput, Priority, TaskCategory } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTask = async (data: CreateTaskInput) => {
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setEditingTask(null);
    fetchTasks();
  };

  // Sort tasks client-side
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const weight: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            <span>Task Manager</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize, prioritize, and manage persistent task records
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search tasks by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-navy-950 border border-navy-800 rounded-xl text-xs font-semibold">
            {(['all', 'pending', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Priority, Category & Sort */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-navy-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-violet-400" />
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'title')}
              className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="dueDate">Due Date (Earliest First)</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="title">Title (Alphabetical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-navy-900 rounded-2xl">
            Loading tasks...
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-2xl">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No matching tasks found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or add a new task.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setModalOpen(true);
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}
