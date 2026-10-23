'use client';

import React, { useState, useEffect } from 'react';
import { ProductivityInsights } from '@/lib/types';
import { isOverdue } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lightbulb,
  PieChart,
  Target,
} from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // We can invoke the server-side get_daily_summary tool via direct executor or a dedicated endpoint
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasks = data.tasks as any[];
        const completed = tasks.filter((t) => t.completed);
        const pending = tasks.filter((t) => !t.completed);
        const overdue = pending.filter((t) => isOverdue(t.dueDate, t.completed));

        const totalEstMinutes = pending.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
        const completedMinutes = completed.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

        const priorityBreakdown = {
          high: pending.filter((t) => t.priority === 'high').length,
          medium: pending.filter((t) => t.priority === 'medium').length,
          low: pending.filter((t) => t.priority === 'low').length,
        };

        const categoryBreakdown = pending.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const actionTips: string[] = [];
        if (overdue.length > 0) {
          actionTips.push(
            `You have ${overdue.length} overdue task(s). Consider tackling these first thing in the morning before starting new projects.`
          );
        } else {
          actionTips.push('Zero overdue tasks! Your deadlines are well managed.');
        }

        if (priorityBreakdown.high > 2) {
          actionTips.push(
            `You have ${priorityBreakdown.high} high-priority tasks in flight. Try time-blocking 90-minute deep work sprints with notifications paused.`
          );
        }

        if (completed.length > 0) {
          actionTips.push(
            `Great momentum: you've already finished ${completed.length} task(s) totaling ~${Math.round(completedMinutes / 60 * 10) / 10} hours of focused work.`
          );
        }

        actionTips.push(
          'Remember to keep task estimations under 90 minutes. Break larger objectives into smaller milestone subtasks.'
        );

        setInsights({
          totalTasks: tasks.length,
          completedTasks: completed.length,
          pendingTasks: pending.length,
          overdueTasks: overdue.length,
          completionRate:
            tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
          totalEstimatedMinutes: totalEstMinutes,
          completedMinutes,
          priorityBreakdown,
          categoryBreakdown,
          insights: actionTips,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Analyzing productivity statistics...
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="pb-4 border-b border-navy-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Productivity Insights</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Data-driven analytics, workload distribution, and actionable recommendations
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {insights.completionRate}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {insights.completedTasks} completed / {insights.totalTasks} total tasks
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Completed Work</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {Math.round((insights.completedMinutes / 60) * 10) / 10}h
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {insights.completedMinutes} minutes completed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Remaining Workload</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {Math.round((insights.totalEstimatedMinutes / 60) * 10) / 10}h
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {insights.pendingTasks} pending tasks
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Overdue Work</span>
            <AlertCircle
              className={`w-4 h-4 ${
                insights.overdueTasks > 0 ? 'text-red-400' : 'text-slate-500'
              }`}
            />
          </div>
          <p
            className={`mt-3 text-3xl font-extrabold ${
              insights.overdueTasks > 0 ? 'text-red-400' : 'text-white'
            }`}
          >
            {insights.overdueTasks}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {insights.overdueTasks > 0 ? 'Deadlines missed' : 'Zero overdue items'}
          </p>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            <span>Pending Priority Distribution</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400 font-semibold">High Priority</span>
                <span className="text-white font-mono">{insights.priorityBreakdown.high}</span>
              </div>
              <div className="w-full bg-navy-950 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      insights.pendingTasks > 0
                        ? (insights.priorityBreakdown.high / insights.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">Medium Priority</span>
                <span className="text-white font-mono">{insights.priorityBreakdown.medium}</span>
              </div>
              <div className="w-full bg-navy-950 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${
                      insights.pendingTasks > 0
                        ? (insights.priorityBreakdown.medium / insights.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Low Priority</span>
                <span className="text-white font-mono">{insights.priorityBreakdown.low}</span>
              </div>
              <div className="w-full bg-navy-950 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${
                      insights.pendingTasks > 0
                        ? (insights.priorityBreakdown.low / insights.pendingTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Workload by Category</span>
          </h3>

          <div className="space-y-2.5">
            {Object.keys(insights.categoryBreakdown).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active pending tasks.
              </p>
            ) : (
              Object.entries(insights.categoryBreakdown).map(([category, count]) => (
                <div
                  key={category}
                  className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-200">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{count}</span>
                    <span className="text-slate-500">task(s)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Actionable AI Recommendations</span>
        </h3>

        <div className="space-y-2.5">
          {insights.insights.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-navy-950/60 border border-navy-800 text-xs text-slate-300 flex items-start gap-3"
            >
              <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
              <p className="leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
