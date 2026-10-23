'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task, DailyPlan, CreateTaskInput } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import VoiceAssistantPanel from '@/components/VoiceAssistantPanel';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlan = async () => {
    try {
      setLoadingPlan(true);
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableHours: 6 }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setDailyPlan(data.plan);
      }
    } catch (e) {
      console.error('Failed to fetch plan', e);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchPlan();
  }, []);

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
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

  // Metrics calculation
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const pendingCount = pendingTasks.length;
  const overdueCount = pendingTasks.filter(
    (t) => new Date(t.dueDate).getTime() < Date.now()
  ).length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{getGreeting()}, Builder</span>
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              LifePilot AI
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your personalized productivity briefing and daily trajectory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-white text-xs font-semibold shadow transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Task</span>
          </button>

          <Link
            href="/voice"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Ask Alexa+ Voice</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Card */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{completionRate}%</span>
            <span className="text-xs text-slate-400">
              ({completedCount} of {tasks.length} done)
            </span>
          </div>
          <div className="mt-3 w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{pendingCount}</span>
            <span className="text-xs text-slate-400">active items</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Estimated workload: ~
            {Math.round(
              pendingTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0) / 60
            )}
            h total
          </p>
        </div>

        {/* High Priority Blockers */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Top Priorities
            </span>
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-violet-300">
              {highPriorityTasks.length}
            </span>
            <span className="text-xs text-slate-400">require focus</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">High-impact tasks</p>
        </div>

        {/* Overdue Alerts */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overdue
            </span>
            <AlertTriangle
              className={`w-5 h-5 ${overdueCount > 0 ? 'text-red-400' : 'text-slate-500'}`}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold ${
                overdueCount > 0 ? 'text-red-400' : 'text-white'
              }`}
            >
              {overdueCount}
            </span>
            <span className="text-xs text-slate-400">
              {overdueCount === 0 ? 'all on track' : 'need attention'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {overdueCount > 0 ? 'Reschedule or finish first' : 'Zero deadlines missed'}
          </p>
        </div>
      </div>

      {/* Main Grid: Prominent Voice/Assistant Panel & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Alexa+ Voice Assistant */}
        <div className="lg:col-span-7 space-y-6">
          <VoiceAssistantPanel
            onToolExecuted={() => {
              fetchTasks();
              fetchPlan();
            }}
          />

          {/* Today's Schedule Timeline Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Smart Schedule Timeline</span>
              </h3>
              <Link
                href="/planner"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ScheduleTimeline plan={dailyPlan} loading={loadingPlan} />
          </div>
        </div>

        {/* Right Column (5 cols): Today's Priority Tasks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Priority Task Queue
              </h2>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1 font-medium"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-navy-900 rounded-2xl">
                Loading tasks...
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-navy-900 border border-navy-800 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-200">All tasks completed!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Use the voice assistant or add a new task to continue.
                </p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
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
              ))
            )}
          </div>
        </div>
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
