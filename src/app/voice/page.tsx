'use client';

import React, { useState } from 'react';
import VoiceAssistantPanel from '@/components/VoiceAssistantPanel';
import ActivityLogViewer from '@/components/ActivityLogViewer';
import { Info, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function VoicePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Hackathon Disclaimer Banner */}
      <div className="pb-4 border-b border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Primary Track
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Alexa+ Simulation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>LifePilot Voice Assistant</span>
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Simulated Alexa+ conversational productivity agent with server-side tool orchestration.
            </p>
          </div>
        </div>

        {/* Explicit Disclosure Notice (as required by hackathon rules) */}
        <div className="mt-4 p-3.5 rounded-xl bg-navy-900/90 border border-navy-700/80 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">
              Simulated Alexa+ Experience Path Notice
            </p>
            <p className="text-slate-400 leading-relaxed">
              This experience is built specifically for the Amazon Developer Hackathon&apos;s permitted
              simulated Alexa+ web path. It simulates an intelligent voice and chat agent capable of natural
              language intent resolution, multi-tool selection, and server execution. It is{' '}
              <strong>not</strong> a live connection to an Amazon Alexa hardware device or user account.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Voice Interaction on Left, Live Audit Trail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Assistant Panel */}
        <div className="lg:col-span-7">
          <VoiceAssistantPanel
            onToolExecuted={() => setRefreshKey((k) => k + 1)}
            fullHeight
          />
        </div>

        {/* Right Column: Assistant Activity Log Viewer */}
        <div className="lg:col-span-5">
          <ActivityLogViewer key={refreshKey} autoRefresh />
        </div>
      </div>

      {/* Capabilities Overview Section */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Application Tools (Server Executed)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              create_task
            </span>
            <p className="text-slate-400">
              Creates structured tasks with title, priority, category, due dates, and durations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              list_tasks
            </span>
            <p className="text-slate-400">
              Filters tasks by status (pending/completed), priority, category, or search query.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              complete_task
            </span>
            <p className="text-slate-400">
              Locates tasks by fuzzy title query or ID and marks them completed in SQLite.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              update_task
            </span>
            <p className="text-slate-400">
              Modifies task priorities, deadlines, or estimated durations safely.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              get_daily_summary
            </span>
            <p className="text-slate-400">
              Synthesizes completion metrics, overdue blockers, and workload totals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="font-mono font-bold text-cyan-400 block mb-1">
              generate_daily_plan
            </span>
            <p className="text-slate-400">
              Calculates non-overlapping time blocks and explains prioritization logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
