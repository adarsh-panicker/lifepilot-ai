'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMode } from '@/lib/mode-context';
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { ToolCallRecord } from '@/lib/types';

interface VoiceAssistantPanelProps {
  onToolExecuted?: () => void;
  fullHeight?: boolean;
}

export default function VoiceAssistantPanel({
  onToolExecuted,
  fullHeight = false,
}: VoiceAssistantPanelProps) {
  const { mode } = useMode();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [lastToolCalls, setLastToolCalls] = useState<ToolCallRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const presetQueries = [
    'Plan my day. I have an assignment due tonight.',
    'Create a study plan for the next three hours.',
    'What should I focus on first?',
    'Add a task to finish my project report by 8 PM with high priority.',
    'I have only 30 minutes. Help me make progress.',
    'Summarize my pending tasks and suggest a realistic plan.',
  ];

  useEffect(() => {
    // Check Web Speech API support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied by browser. You can type or click any demo prompt below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for spoken audio
      const clean = text.replace(/[*_#`]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isProcessing) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.suggestion || 'Request failed');
      }

      const reply = data.response.message;
      setLastResponse(reply);
      setLastToolCalls(data.response.toolCalls || []);
      speakText(reply);
      setInput('');

      if (onToolExecuted) {
        onToolExecuted();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden ${
        fullHeight ? 'h-full' : ''
      }`}
    >
      {/* Top simulated Alexa+ Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                LifePilot Voice Assistant
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Alexa+ Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Natural speech & text command execution with structured tool calls
            </p>
          </div>
        </div>

        {/* TTS audio toggle */}
        <button
          type="button"
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            ttsEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-slate-200'
          }`}
          title={ttsEnabled ? 'Voice feedback active' : 'Enable voice audio feedback'}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{ttsEnabled ? 'Spoken Reply ON' : 'Audio OFF'}</span>
        </button>
      </div>

      {/* Center Simulated Microphone & Wave Visualization */}
      <div className="my-5 flex flex-col items-center justify-center text-center">
        <div className="relative mb-3">
          <button
            type="button"
            onClick={toggleListening}
            disabled={!speechSupported || isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 ring-4 ring-red-500/30 scale-105'
                : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 hover:scale-105 hover:shadow-cyan-500/20'
            } disabled:opacity-50 text-white`}
            title={
              speechSupported
                ? isListening
                  ? 'Click to stop listening'
                  : 'Click to speak'
                : 'Speech recognition not supported in this browser. Type below.'
            }
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Voice Wave Animation when active */}
        {isListening ? (
          <div className="flex items-center gap-1.5 h-8 my-1">
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="text-xs text-cyan-400 font-medium ml-2 animate-pulse">
              Listening to voice request...
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            {speechSupported
              ? 'Click the microphone to speak, or select a demo prompt below'
              : 'Voice recognition not active. You can type or select any demo prompt.'}
          </p>
        )}
      </div>

      {/* Preset Demo Prompts */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Try Saying or Clicking:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {presetQueries.map((query, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuery(query)}
              disabled={isProcessing}
              className="text-xs px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-navy-850 transition-all text-left flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span>&quot;{query}&quot;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Response Box / Tool Execution Display */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errorMessage}</p>
            {mode === 'bedrock' && (
              <p className="mt-1 text-slate-300">
                You can switch to <strong>Demo Mode</strong> in Settings to test without AWS credentials.
              </p>
            )}
          </div>
        </div>
      )}

      {lastResponse && !errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-navy-950/80 border border-violet-500/30 text-xs">
          {/* Tool Calls Badge */}
          {lastToolCalls.length > 0 && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-navy-800 flex-wrap">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                EXECUTED TOOL: {lastToolCalls.map((t) => t.toolName).join(', ')}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                ✓ Server action confirmed
              </span>
            </div>
          )}

          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {lastResponse}
          </div>
        </div>
      )}

      {/* Input bar fallback */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="mt-auto flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type a natural language command (e.g. 'Plan my day')..."
            disabled={isProcessing}
            className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors pr-10"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md disabled:opacity-40 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
