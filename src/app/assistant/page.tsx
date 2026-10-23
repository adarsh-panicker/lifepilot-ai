'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMode } from '@/lib/mode-context';
import { ChatMessage, ToolCallRecord } from '@/lib/types';
import { Send, Bot, User, Sparkles, Trash2, Cpu, Cloud, CheckCircle2 } from 'lucide-react';

export default function AssistantPage() {
  const { mode } = useMode();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm LifePilot, your personal productivity assistant. I can help organize your day, create and track tasks, prioritize what matters most, or build a realistic time-blocked schedule.\n\nTry asking me:\n- *\"Plan my day. I have an assignment due tonight.\"*\n- *\"What should I focus on first?\"*\n- *\"Add a task to submit the project report by 8 PM.\"*",
      timestamp: new Date().toISOString(),
      mode: 'demo',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // Build history
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorReply = data.error || data.suggestion || 'Failed to process request';
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${errorReply}`,
            timestamp: new Date().toISOString(),
            mode,
          },
        ]);
        return;
      }

      const botMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.response.message,
        timestamp: new Date().toISOString(),
        toolCalls: data.response.toolCalls,
        mode,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Network error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date().toISOString(),
          mode,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear the current conversation thread?')) {
      setMessages([
        {
          id: 'welcome_reset',
          role: 'assistant',
          content:
            "Conversation reset. How can I help you optimize your day?",
          timestamp: new Date().toISOString(),
          mode: 'demo',
        },
      ]);
    }
  };

  const suggestedPrompts = [
    'Plan my day. I have an assignment due tonight.',
    'Create a study plan for the next three hours.',
    'What should I focus on first?',
    'Add a task to finish my project report by 8 PM.',
    'I have only 30 minutes. Help me make progress.',
    'Summarize my pending tasks.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>AI Assistant Conversation</span>
          </h1>
          <p className="text-xs text-slate-400">
            Natural language task scheduling, prioritization, and execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-800 text-slate-300">
            {mode === 'bedrock' ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bedrock Mode</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span>Demo Engine</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-navy-900/60 border border-navy-800/80">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-navy-800 border border-navy-700 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-violet-600/30 text-white border border-violet-500/40'
                    : 'bg-navy-950/90 text-slate-200 border border-navy-800'
                }`}
              >
                {/* Tool call indication */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mb-3 pb-2 border-b border-navy-800 space-y-1.5">
                    {msg.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-navy-900 px-2 py-1 rounded border border-navy-700/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Invoked tool: {tc.toolName}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="mt-2 text-[10px] text-slate-500 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-navy-800 border border-navy-700 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-navy-950/90 border border-navy-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Thinking and executing application tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(p)}
            disabled={isSending}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-white transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask LifePilot to plan your day, add a task, or prioritize workload..."
          disabled={isSending}
          className="flex-1 px-4 py-3 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md disabled:opacity-40 transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
