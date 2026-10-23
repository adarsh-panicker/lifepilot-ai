'use client';

import React from 'react';
import { DailyPlan } from '@/lib/types';
import { Clock, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScheduleTimelineProps {
  plan: DailyPlan | null;
  loading?: boolean;
}

export default function ScheduleTimeline({ plan, loading = false }: ScheduleTimelineProps) {
  if (loading) {
    return (
      <div className="p-8 text-center bg-navy-900 border border-navy-800 rounded-2xl animate-pulse">
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin" />
        <p className="text-sm font-semibold text-slate-200">
          Generating smart, non-overlapping daily schedule...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Evaluating task deadlines, priorities, and realistic energy blocks
        </p>
      </div>
    );
  }

  if (!plan || !plan.items || plan.items.length === 0) {
    return (
      <div className="p-8 text-center bg-navy-900 border border-navy-800 rounded-2xl">
        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No active daily plan yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Ask the assistant to &quot;Plan my day&quot; or click &quot;Generate Daily Schedule&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-navy-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Today&apos;s Smart Schedule</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
              NON-OVERLAPPING
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{plan.summary}</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-cyan-400">
            {Math.round(plan.totalPlannedMinutes / 60 * 10) / 10}h Allocated
          </span>
          <span className="text-xs text-slate-500 block">
            of {Math.round(plan.availableMinutes / 60)}h limit
          </span>
        </div>
      </div>

      {/* Timeline items list */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-navy-800">
        {plan.items.map((item, idx) => {
          const isBreak = item.isBreak;

          return (
            <div key={item.id || idx} className="relative group">
              {/* Timeline circle node */}
              <div
                className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                  isBreak
                    ? 'bg-amber-400 border-navy-900'
                    : item.priority === 'high'
                    ? 'bg-red-400 border-navy-900'
                    : 'bg-cyan-400 border-navy-900'
                }`}
              />

              <div
                className={`p-4 rounded-xl border transition-all ${
                  isBreak
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : 'bg-navy-950/80 border-navy-800 hover:border-violet-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-navy-900 px-2 py-0.5 rounded border border-navy-700">
                        {item.startTime} – {item.endTime}
                      </span>

                      <span className="text-xs text-slate-400">
                        ({item.durationMinutes} mins)
                      </span>

                      {!isBreak && (
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            item.priority === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      {isBreak ? (
                        <>
                          <Coffee className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{item.title}</span>
                        </>
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </h4>

                    {item.reason && (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        💡 {item.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
