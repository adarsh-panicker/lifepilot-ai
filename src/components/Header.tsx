'use client';

import React from 'react';
import Link from 'next/link';
import { useMode } from '@/lib/mode-context';
import { Calendar, Cpu, Cloud, Mic, Sparkles } from 'lucide-react';

export default function Header() {
  const { mode, bedrockStatus } = useMode();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 border-b border-navy-800 bg-navy-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode Status Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors bg-navy-900 hover:bg-navy-850"
          style={{
            borderColor: mode === 'bedrock' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(139, 92, 246, 0.4)',
          }}
        >
          {mode === 'bedrock' ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-200 font-medium">Bedrock Mode</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  bedrockStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-violet-200 font-medium">Demo Mode (Local Engine)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </>
          )}
        </Link>

        {/* Quick Voice Access */}
        <Link
          href="/voice"
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow-cyan-500/20 hover:scale-[1.02]"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Alexa+ Voice</span>
          <Sparkles className="w-3 h-3 text-cyan-200" />
        </Link>
      </div>
    </header>
  );
}
