'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  MessageSquare,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  RotateCcw,
  Cloud,
  Cpu,
  Check,
} from 'lucide-react';
import { useMode } from '@/lib/mode-context';

export default function Navigation() {
  const pathname = usePathname();
  const { mode, setMode, bedrockStatus } = useMode();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/voice',
      label: 'Voice Assistant',
      icon: Mic,
      badge: 'Alexa+ Sim',
      highlight: true,
    },
    { href: '/assistant', label: 'AI Assistant', icon: MessageSquare },
    { href: '/tasks', label: 'Task Manager', icon: CheckSquare },
    { href: '/planner', label: 'Smart Planner', icon: Calendar },
    { href: '/insights', label: 'Productivity Insights', icon: BarChart3 },
    { href: '/settings', label: 'Settings & Bedrock', icon: Settings },
  ];

  const handleResetData = async () => {
    if (resetting) return;
    const confirm = window.confirm(
      'Reset all tasks and activity logs to realistic initial demo data?'
    );
    if (!confirm) return;

    try {
      setResetting(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 2500);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">LifePilot</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Personal Productivity</p>
          </div>
        </Link>

        {/* Alexa+ Sim Badge */}
        <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-medium text-cyan-200">Alexa+ Inspired</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">SIMULATION</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-white border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-cyan-400 group-hover:text-cyan-300'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-cyan-500 text-navy-950'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mode Switcher & Footer */}
      <div className="p-4 border-t border-navy-800 space-y-3 bg-navy-950/60">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>AI Provider Mode:</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                mode === 'bedrock'
                  ? bedrockStatus?.configured
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/30'
                    : 'bg-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-cyan-400 ring-2 ring-cyan-500/30'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 p-1 bg-navy-900 border border-navy-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                mode === 'demo'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('bedrock')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                mode === 'bedrock'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Bedrock</span>
            </button>
          </div>

          {mode === 'bedrock' && !bedrockStatus?.configured && (
            <p className="mt-1.5 text-[11px] text-amber-400/90 leading-tight">
              ⚠️ AWS credentials pending.{' '}
              <Link href="/settings" className="underline hover:text-amber-300">
                Setup
              </Link>
            </p>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={handleResetData}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-navy-850 hover:bg-navy-800 border border-navy-700/60 rounded-lg transition-colors disabled:opacity-50"
        >
          {resetSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Data Reset!</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
