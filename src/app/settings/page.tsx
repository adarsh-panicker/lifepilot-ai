'use client';

import React, { useState } from 'react';
import { useMode } from '@/lib/mode-context';
import {
  Settings,
  Cpu,
  Cloud,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Key,
  Server,
} from 'lucide-react';

export default function SettingsPage() {
  const { mode, setMode, bedrockStatus, refreshBedrockStatus, isLoadingStatus } = useMode();
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all tasks and logs back to default demo data?')) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetMsg('Demo data has been reset successfully with realistic relative dates!');
        setTimeout(() => setResetMsg(''), 4000);
      }
    } catch {
      setResetMsg('Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-navy-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>System Settings & AI Providers</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Amazon Bedrock Converse API, switch execution modes, and manage data
        </p>
      </div>

      {resetMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{resetMsg}</span>
        </div>
      )}

      {/* Mode Selection Section */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-violet-400" />
          <span>AI Engine Provider Mode</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          LifePilot AI includes two distinct, decoupled modes. You can run 100% offline using the local Demo Engine,
          or switch to live Amazon Bedrock Converse API for real LLM model inference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Demo Mode Card */}
          <div
            onClick={() => setMode('demo')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'demo'
                ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500'
                : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-400" />
                <span className="font-bold text-white text-sm">Demo Mode (Local Engine)</span>
              </div>
              {mode === 'demo' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500 text-white">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic, zero-credential local assistant. Simulates intent resolution and executes all application tools instantly without AWS costs.
            </p>
          </div>

          {/* Bedrock Mode Card */}
          <div
            onClick={() => setMode('bedrock')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'bedrock'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-sm">Amazon Bedrock Mode</span>
              </div>
              {mode === 'bedrock' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-navy-950">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sends requests to AWS Bedrock Converse API with model tool calling. Requires AWS credentials and Bedrock model access.
            </p>
          </div>
        </div>
      </div>

      {/* Bedrock Diagnostic Panel */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Amazon Bedrock Configuration Status
            </h2>
          </div>

          <button
            type="button"
            onClick={refreshBedrockStatus}
            disabled={isLoadingStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
            <span className="text-slate-500 block mb-1">Target AWS Region</span>
            <span className="font-mono text-white font-semibold">
              {bedrockStatus?.region || process.env.AWS_REGION || 'us-east-1'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
            <span className="text-slate-500 block mb-1">Configured Model ID</span>
            <span className="font-mono text-cyan-300 font-semibold truncate block">
              {bedrockStatus?.modelId || 'anthropic.claude-3-5-sonnet-20240620-v1:0'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
            <span className="text-slate-500 block mb-1">Connection State</span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${
                bedrockStatus?.configured ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {bedrockStatus?.configured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified & Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>No AWS Credentials Found</span>
                </>
              )}
            </span>
          </div>
        </div>

        {bedrockStatus?.error && (
          <div className="p-4 rounded-xl bg-navy-950 border border-amber-900/50 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-0.5">Status Note:</p>
              <p>{bedrockStatus.error}</p>
            </div>
          </div>
        )}

        {/* Instructions on how to configure Bedrock */}
        <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>How to Configure AWS Bedrock Credentials:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400 leading-relaxed">
            <li>
              Enable model access for Anthropic Claude 3.5 Sonnet or Amazon Nova in the AWS Bedrock Console.
            </li>
            <li>
              Create a local <code className="text-cyan-300 bg-navy-900 px-1 py-0.5 rounded">.env.local</code> file based on <code className="text-cyan-300 bg-navy-900 px-1 py-0.5 rounded">.env.example</code>.
            </li>
            <li>
              Add your <code className="text-violet-300">AWS_ACCESS_KEY_ID</code> and <code className="text-violet-300">AWS_SECRET_ACCESS_KEY</code> (or rely on IAM roles / ~/.aws/credentials).
            </li>
            <li>Restart the server and click &quot;Test Connection&quot; above.</li>
          </ol>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Demo Data Management</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Need to prepare for a clean video demo? Resetting clears recent changes and restores realistic fictional tasks with deadlines relative to today.
        </p>

        <button
          type="button"
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset to Default Demo Tasks'}</span>
        </button>
      </div>
    </div>
  );
}
