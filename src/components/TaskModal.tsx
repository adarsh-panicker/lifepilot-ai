'use client';

import React, { useState, useEffect } from 'react';
import { Task, CreateTaskInput, Priority, TaskCategory } from '@/lib/types';
import { X, Calendar, Clock, Tag } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput) => Promise<void>;
  initialTask?: Task | null;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialTask,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      // Format to YYYY-MM-DD
      const dateVal = initialTask.dueDate ? initialTask.dueDate.split('T')[0] : '';
      setDueDate(dateVal);
      setEstimatedMinutes(initialTask.estimatedMinutes);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setEstimatedMinutes(45);
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedMinutes: Number(estimatedMinutes) || 30,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{initialTask ? 'Edit Task' : 'Create New Task'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Complete Alexa+ hackathon submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key notes, checklist items, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-400" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Duration</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
