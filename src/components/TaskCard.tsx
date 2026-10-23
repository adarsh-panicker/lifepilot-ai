'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { formatDate, isOverdue, formatDuration } from '@/lib/utils';
import { Check, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.completed);

  const priorityColors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  const categoryColors: Record<string, string> = {
    Work: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    Study: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Health: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Personal: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    Other: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-navy-900/40 border-navy-800/60 opacity-60 hover:opacity-90'
          : 'bg-navy-900/90 border-navy-800 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Complete Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-400 text-navy-950'
              : 'border-slate-600 hover:border-cyan-400 bg-navy-850'
          }`}
          title={task.completed ? 'Mark pending' : 'Mark completed'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                categoryColors[task.category] || categoryColors.Other
              }`}
            >
              {task.category}
            </span>

            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {overdue && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-800/60">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span>Overdue</span>
              </span>
            )}
          </div>

          <h3
            className={`font-semibold text-sm tracking-tight text-white ${
              task.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row: Due Date and Duration */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDuration(task.estimatedMinutes)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Due:</span>
              <span className={overdue ? 'text-red-300 font-medium' : ''}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-navy-800 transition-colors"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
