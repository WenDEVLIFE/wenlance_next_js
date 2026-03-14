'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Trash2, AlertCircle, X, MessageSquare, Send, User } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { dashboardRepository, DashboardData } from '@/lib/repositories/DashboardRepository';
import { GeminiService, useGeminiChat } from '@/lib/services/GeminiService';
import AppColors from '@/lib/utils/colors';


// ─── Component ──────────────────────────────────────────────
export default function AIAssistantView() {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Subscribe to all financial data for context
  useEffect(() => {
    const unsubscribe = dashboardRepository.listenToDashboard((data) => {
      setDashboardData(data);
    });
    return () => unsubscribe();
  }, []);

  // Format context for Gemini using the service helper
  const systemContext = React.useMemo(() => 
    GeminiService.formatFinancialContext(dashboardData), 
  [dashboardData]);

  const {
    messages,
    isLoading,
    error,
    isConfigured,
    sendMessage,
    clearChat,
    clearError,
  } = useGeminiChat({ systemContext });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading || !isConfigured) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PageTransition>
      {/* Container matches the Dashboard / Savings background gradients */}
      <div className="flex flex-col h-screen bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300">

        {/* Header */}
        <div className="flex-none bg-white dark:bg-[#023E8A] shadow-sm z-20 border-b border-zinc-100 dark:border-white/10 transition-colors">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-100 dark:bg-white/10 rounded-xl">
                <Bot size={24} className="text-blue-600 dark:text-[#48CAE4]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white font-sans">
                  AI Assistant
                </h1>
                <span className="text-xs text-zinc-500 dark:text-white/70 font-sans">
                  Powered by Gemini
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-sans"
                  title="Clear chat"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <div className="bg-zinc-100 dark:bg-white/10 p-1 rounded-full">
                <ThemeToggle iconSize={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="m-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={18} />
              <span className="text-sm font-medium font-sans">{error}</span>
            </div>
            <button onClick={clearError} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-red-500">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Missing API Key Warning */}
        {!isConfigured && (
          <div className="m-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex gap-3 z-10">
            <AlertCircle className="text-amber-500 flex-shrink-0" />
            <div className="flex flex-col text-sm text-amber-700 dark:text-amber-400 font-sans">
              <strong>Missing API Key</strong>
              <p>Please add NEXT_PUBLIC_GEMINI_API to your .env.local file to use the AI Assistant.</p>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <MessageSquare size={64} className="text-zinc-300 dark:text-zinc-600 mb-6" />
              <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 font-sans mb-2">
                Start a conversation
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-sans">
                Ask me anything about your finances, projects, or expenses
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <AnimatedListItem key={idx} index={idx} delay={0.05} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                        ? 'bg-blue-100 dark:bg-blue-900/30 ml-3'
                        : 'bg-blue-100 dark:bg-white/10 mr-3'
                        }`}>
                        {isUser
                          ? <User size={16} className="text-blue-600 dark:text-[#48CAE4]" />
                          : <Bot size={16} className="text-blue-600 dark:text-[#48CAE4]" />
                        }
                      </div>

                      {/* Bubble */}
                      <div className={`
                        px-4 py-3 rounded-2xl font-sans text-[15px] leading-relaxed
                        ${isUser
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-[#023E8A] text-zinc-800 dark:text-white rounded-tl-sm border border-zinc-100 dark:border-white/10 shadow-sm'
                        }
                      `}>
                        {msg.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </AnimatedListItem>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <AnimatedListItem index={messages.length} delay={0.05} className="flex justify-start">
                  <div className="flex items-start max-w-[85%] flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-white/10 mr-3 flex items-center justify-center">
                      <Bot size={16} className="text-blue-600 dark:text-[#48CAE4]" />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#023E8A] rounded-tl-sm border border-zinc-100 dark:border-white/10 shadow-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </AnimatedListItem>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-none bg-white dark:bg-[#023E8A] border-t border-zinc-100 dark:border-white/10 p-4 transition-colors">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !isConfigured}
              placeholder="Type your message..."
              className="
                flex-1 bg-zinc-100 dark:bg-white/5 border-none rounded-full
                px-5 py-3.5 text-[15px] font-sans text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
                disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
              "
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim() || !isConfigured}
              className="
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-blue-600 hover:bg-blue-700 text-white shadow-md
              "
            >
              <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && (
                <div className="absolute w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
