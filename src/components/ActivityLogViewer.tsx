'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronRight, Activity } from 'lucide-react';

interface ActivityLogItem {
  id: string;
  intent: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export default function ActivityLogViewer({ autoRefresh = false }: { autoRefresh?: boolean }) {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logs?limit=15');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Alexa+ Assistant Activity</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-cyan-300 border border-navy-700">
                AUDIT TRAIL
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interpreted intents, tool invocations, and structured results
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title="Refresh activity logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No assistant tool activities recorded yet. Try asking the assistant to plan your day or add a task!
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isSuccess = log.status === 'success';

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 hover:border-navy-700 transition-all text-xs"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="font-mono font-semibold text-cyan-300">
                      {log.toolName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 truncate max-w-[180px] sm:max-w-[280px]">
                      &quot;{log.intent}&quot;
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-slate-500">
                    <span>
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-navy-800 space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Parameters (Validated):</span>
                      <pre className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.input, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Execution Result:</span>
                      <pre className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300 overflow-x-auto max-h-36">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
