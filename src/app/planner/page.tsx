'use client';

import React, { useState, useEffect } from 'react';
import { DailyPlan } from '@/lib/types';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import { Calendar, Clock, RefreshCw, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export default function PlannerPage() {
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableHours, setAvailableHours] = useState(6);
  const [startHour, setStartHour] = useState(9);
  const [focusArea, setFocusArea] = useState('general');

  const generatePlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableHours: Number(availableHours),
          startHour: Number(startHour),
          focusArea,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setDailyPlan(data.plan);
      }
    } catch (e) {
      console.error('Failed to generate daily plan', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-cyan-400" />
            <span>Smart Daily Planner</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Algorithmic, non-overlapping schedule generation optimized for cognitive focus and deadlines
          </p>
        </div>

        <button
          type="button"
          onClick={generatePlan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto hover:scale-[1.02] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Schedule</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Schedule Constraints & Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Available Working Hours */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Available Time Budget:</span>
              <span className="text-cyan-400 font-bold font-mono">{availableHours} Hours</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={availableHours}
              onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 hr (Sprint)</span>
              <span>4 hrs (Half Day)</span>
              <span>8+ hrs (Full Day)</span>
            </div>
          </div>

          {/* Start Hour */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span>Schedule Start Time:</span>
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="8">08:00 AM (Early Start)</option>
              <option value="9">09:00 AM (Standard Workday)</option>
              <option value="10">10:00 AM</option>
              <option value="13">01:00 PM (Afternoon Block)</option>
              <option value="18">06:00 PM (Evening Session)</option>
            </select>
          </div>

          {/* Focus Area */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Focus Priority:</span>
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="general">Balanced (High Priority + Due Dates)</option>
              <option value="urgent">Urgent & Overdue First</option>
              <option value="study">Deep Study & Technical Prep</option>
              <option value="quick">Quick Wins First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Timeline View */}
      <ScheduleTimeline plan={dailyPlan} loading={loading} />

      {/* Logic & Transparency Explanation */}
      <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>How LifePilot Solves Your Schedule:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed">
          <li>
            <strong>Non-Overlapping Blocks:</strong> No two activities occupy the same time window.
          </li>
          <li>
            <strong>Priority Sorting:</strong> Overdue tasks and HIGH priority deliverables are scheduled first during peak cognitive hours.
          </li>
          <li>
            <strong>Rest Integration:</strong> Automatic 10-minute breaks are scheduled after sustained focus intervals to prevent burnout.
          </li>
          <li>
            <strong>Truthful Status:</strong> Tasks remain marked as pending until you explicitly mark them as completed in the application.
          </li>
        </ul>
      </div>
    </div>
  );
}
