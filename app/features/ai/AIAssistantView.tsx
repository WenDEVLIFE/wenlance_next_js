'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Trash2, AlertCircle, X, MessageSquare, Send, User, Cpu, WifiOff, Database, Zap, ArrowUp, ChevronDown, Check } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { dashboardRepository, DashboardData } from '@/lib/repositories/DashboardRepository';
import { webLLMService, AVAILABLE_MODELS, ModelOption } from '@/lib/services/WebLLMService';
import { ragHarness, RAGContext } from '@/lib/ai/RAGHarness';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ragContext?: RAGContext;
}

export default function AIAssistantView() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    const current = webLLMService.currentModel;
    if (current) {
      return AVAILABLE_MODELS.find(m => m.id === current) || AVAILABLE_MODELS[0];
    }
    return AVAILABLE_MODELS[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ text: '', progress: 0 });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<boolean>(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [ragStatus, setRagStatus] = useState({ ready: false, totalChunks: 0 });

  const isModelReady = webLLMService.isModelLoaded;

  useEffect(() => {
    const unsubscribe = dashboardRepository.listenToDashboard(async (data) => {
      setDashboardData(data);
      try {
        await webLLMService.initRAG(data);
        setRagStatus(webLLMService.getRAGStatus());
      } catch (err) {
        console.error('RAG init error:', err);
      }
    });
    return () => unsubscribe();
  }, []);

  const systemContext = React.useMemo(
    () => webLLMService.formatFinancialContext(dashboardData),
    [dashboardData]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isModelReady && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModelReady]);

  const handleLoadModel = async (model?: ModelOption) => {
    const modelToLoad = model || selectedModel;

    if (!webLLMService.isWebGPUSupported) {
      setError('WebGPU is not supported. Please use Chrome 113+ or Edge 113+.');
      return;
    }

    setIsModelLoading(true);
    setLoadProgress({ text: 'Preparing...', progress: 0 });
    setError(null);
    setShowModelPicker(false);

    try {
      await webLLMService.loadModel(modelToLoad.id, (report) => {
        setLoadProgress(report);
      });
      setSelectedModel(modelToLoad);
    } catch (err: any) {
      console.error('Model load error:', err);
      setError(err.message || 'Failed to load model');
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading || !isModelReady) return;

    const ragContext = ragHarness.retrieve(inputText.trim());
    const userMessage: ChatMessage = { role: 'user', content: inputText.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);
    streamRef.current = true;

    try {
      const historyToSend = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      let assistantContent = '';
      const assistantMessage: ChatMessage = { role: 'assistant', content: '', ragContext };
      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of webLLMService.sendMessageStream({
        message: inputText.trim(),
        conversationHistory: historyToSend,
        systemContext: systemContext,
      })) {
        if (!streamRef.current) break;
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent, ragContext };
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to generate response');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      streamRef.current = false;
    }
  }, [inputText, isLoading, isModelReady, messages, systemContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const webGPUSupported = webLLMService.isWebGPUSupported;

  return (
    <PageTransition>
      <div className="flex flex-col h-[100dvh] bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300">

        {/* Header */}
        <div className="flex-none bg-white dark:bg-[#023E8A] shadow-sm z-20 border-b border-zinc-100 dark:border-white/10 transition-colors safe-area-top">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-white/10 rounded-xl">
                <Bot size={20} className="text-blue-600 dark:text-[#48CAE4] sm:hidden" />
                <Bot size={24} className="text-blue-600 dark:text-[#48CAE4] hidden sm:block" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white font-sans">
                  AI Assistant
                </h1>
                <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-white/70 font-sans">
                  {isModelReady
                    ? `${selectedModel.name} · ${ragStatus.totalChunks} chunks`
                    : isModelLoading
                    ? `Loading ${selectedModel.name}...`
                    : 'Select a model to start'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isModelReady && messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-2 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Clear chat"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <div className="bg-zinc-100 dark:bg-white/10 p-1 rounded-full">
                <ThemeToggle iconSize={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium font-sans">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        {/* WebGPU Warning */}
        {!webGPUSupported && (
          <div className="mx-4 mt-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex gap-3 z-10">
            <WifiOff className="text-amber-500 flex-shrink-0" size={20} />
            <div className="flex flex-col text-sm text-amber-700 dark:text-amber-400 font-sans">
              <strong>WebGPU Not Supported</strong>
              <p className="text-xs mt-1">Please use Chrome 113+ or Edge 113+ to run local AI models.</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isModelLoading && (
          <div className="mx-4 mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800/30 rounded-lg animate-pulse">
                <Cpu size={16} className="text-blue-600 dark:text-[#48CAE4]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Loading {selectedModel.name}</p>
                <p className="text-[10px] text-blue-500 dark:text-blue-400">{loadProgress.text || 'Preparing...'}</p>
              </div>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-800/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-[#48CAE4] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(loadProgress.progress * 100, 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 sm:mb-6">
                <Bot size={32} className="text-blue-600 dark:text-[#48CAE4] sm:hidden" />
                <Bot size={40} className="text-blue-600 dark:text-[#48CAE4] hidden sm:block" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 dark:text-zinc-300 font-sans mb-2">
                Ask about your finances
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 font-sans mb-4">
                Expenses, sales, projects, and savings
              </p>
              {!isModelReady && webGPUSupported && (
                <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-sans">
                  Pick a model below to get started
                </p>
              )}
              {isModelReady && ragStatus.ready && (
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/30">
                  <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-sans flex items-center gap-1.5">
                    <Database size={10} />
                    {ragStatus.totalChunks} chunks indexed
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6 pb-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <AnimatedListItem key={idx} index={idx} delay={0.05} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${isUser
                        ? 'bg-blue-100 dark:bg-blue-900/30 ml-2 sm:ml-3'
                        : 'bg-blue-100 dark:bg-white/10 mr-2 sm:mr-3'
                        }`}>
                        {isUser
                          ? <User size={14} className="text-blue-600 dark:text-[#48CAE4]" />
                          : <Bot size={14} className="text-blue-600 dark:text-[#48CAE4]" />
                        }
                      </div>

                      <div className={`
                        px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl font-sans text-[13px] sm:text-[15px] leading-relaxed
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
                    {!isUser && msg.ragContext && msg.ragContext.chunks.length > 0 && (
                      <div className="mt-1 ml-9 sm:ml-11 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">
                        <Database size={8} />
                        <span>{msg.ragContext.dataSummary}</span>
                      </div>
                    )}
                  </AnimatedListItem>
                );
              })}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <AnimatedListItem index={messages.length} delay={0.05} className="flex justify-start">
                  <div className="flex items-start max-w-[90%] sm:max-w-[85%] flex-row">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-white/10 mr-2 sm:mr-3 flex items-center justify-center">
                      <Bot size={14} className="text-blue-600 dark:text-[#48CAE4]" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl bg-white dark:bg-[#023E8A] rounded-tl-sm border border-zinc-100 dark:border-white/10 shadow-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
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

        {/* Input Area with Model Picker */}
        <div className="flex-none bg-white dark:bg-[#023E8A] border-t border-zinc-100 dark:border-white/10 transition-colors safe-area-bottom">
          {/* Model Picker Dropdown */}
          {showModelPicker && (
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="bg-zinc-50 dark:bg-[#03045E] rounded-xl border border-zinc-200 dark:border-zinc-600 overflow-hidden shadow-lg">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-600">
                  <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Select Model</p>
                </div>
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = selectedModel.id === model.id;
                  const isActive = webLLMService.currentModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelPicker(false);
                        if (!isActive && webGPUSupported) {
                          handleLoadModel(model);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                      }`}>
                        {model.id.includes('0.5B') ? <Zap size={14} /> : <Cpu size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">{model.name}</span>
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">
                              Loaded
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{model.description} · {model.size}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-blue-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4">
            <div className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
              {/* Model Selector Button */}
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all cursor-pointer border
                  ${showModelPicker
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-[#48CAE4]'
                    : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                  }
                `}
                title="Switch model"
              >
                {selectedModel.id.includes('0.5B') ? <Zap size={12} /> : <Cpu size={12} />}
                <span className="hidden sm:inline">{selectedModel.name}</span>
                <ChevronDown size={10} className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !isModelReady}
                  placeholder={isModelReady ? "Ask about your finances..." : "Load a model first..."}
                  className="
                    w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-zinc-600 rounded-2xl
                    pl-4 pr-12 py-3 sm:py-3.5 text-[13px] sm:text-[15px] font-sans text-zinc-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all
                    disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                  "
                />
              </div>

              {/* Send / Stop Button */}
              {isLoading ? (
                <button
                  onClick={() => { streamRef.current = false; setIsLoading(false); }}
                  className="
                    flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all
                    bg-red-500 hover:bg-red-600 text-white shadow-md cursor-pointer
                  "
                  title="Stop"
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !isModelReady}
                  className="
                    flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed
                    bg-blue-600 hover:bg-blue-700 text-white shadow-md
                  "
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
