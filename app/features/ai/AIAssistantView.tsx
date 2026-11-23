'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  BotIcon, 
  TrashBinTrashIcon, 
  DangerCircleIcon, 
  CloseCircleIcon, 
  UserIcon, 
  CpuIcon, 
  WiFiOffIcon, 
  DatabaseIcon, 
  BoltIcon, 
  ArrowUpIcon, 
  AltArrowDownIcon, 
  CheckIcon 
} from '@solar-icons/react/linear';
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
      <div className="flex flex-col h-[100dvh] bg-background transition-colors duration-300">

        {/* Header */}
        <div className="flex-none bg-white dark:bg-zinc-900 shadow-xs z-20 border-b border-zinc-200/80 dark:border-zinc-800 transition-colors safe-area-top">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl">
                <BotIcon size={22} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                  AI Financial Assistant
                </h1>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                  {isModelReady
                    ? `${selectedModel.name} · ${ragStatus.totalChunks} chunks indexed`
                    : isModelLoading
                    ? `Loading ${selectedModel.name}...`
                    : 'Local WebGPU model · Private on-device'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isModelReady && messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Clear chat"
                >
                  <TrashBinTrashIcon size={18} />
                </button>
              )}
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                <ThemeToggle iconSize={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <DangerCircleIcon size={16} className="shrink-0" />
              <span className="text-xs sm:text-sm font-medium font-sans">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-rose-500">
              <CloseCircleIcon size={16} />
            </button>
          </div>
        )}

        {/* WebGPU Warning */}
        {!webGPUSupported && (
          <div className="mx-4 mt-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex gap-3 z-10">
            <WiFiOffIcon className="text-amber-500 shrink-0" size={20} />
            <div className="flex flex-col text-sm text-amber-700 dark:text-amber-400 font-sans">
              <strong>WebGPU Not Supported</strong>
              <p className="text-xs mt-1">Please use Chrome 113+ or Edge 113+ to run on-device AI models.</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isModelLoading && (
          <div className="mx-4 mt-3 p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-xl z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-lg animate-pulse">
                <CpuIcon size={16} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300">Loading {selectedModel.name}</p>
                <p className="text-[10px] text-sky-500 dark:text-sky-400">{loadProgress.text || 'Preparing model weights...'}</p>
              </div>
            </div>
            <div className="w-full bg-sky-100 dark:bg-sky-900/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-sky-600 dark:bg-sky-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(loadProgress.progress * 100, 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center mb-4">
                <BotIcon size={32} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-sans mb-1">
                Ask about your finances
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mb-4">
                Inquire about expenses, project timelines, and savings utilization
              </p>
              {!isModelReady && webGPUSupported && (
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                  Select a model below to load on-device
                </p>
              )}
              {isModelReady && ragStatus.ready && (
                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                    <DatabaseIcon size={12} />
                    {ragStatus.totalChunks} chunks indexed
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5 pb-4 max-w-3xl mx-auto">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <AnimatedListItem key={idx} index={idx} delay={0.05} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${isUser
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ml-2 sm:ml-3 border border-sky-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mr-2 sm:mr-3 border border-zinc-200/60 dark:border-zinc-700/60'
                        }`}>
                        {isUser
                          ? <UserIcon size={16} />
                          : <BotIcon size={16} />
                        }
                      </div>

                      <div className={`
                        px-4 py-3 rounded-2xl font-sans text-sm leading-relaxed
                        ${isUser
                          ? 'bg-sky-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-xs border border-zinc-200/80 dark:border-zinc-800 shadow-xs'
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
                      <div className="mt-1 ml-9 sm:ml-11 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        <DatabaseIcon size={10} />
                        <span>{msg.ragContext.dataSummary}</span>
                      </div>
                    )}
                  </AnimatedListItem>
                );
              })}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <AnimatedListItem index={messages.length} delay={0.05} className="flex justify-start">
                  <div className="flex items-start max-w-[90%] sm:max-w-[85%] flex-row">
                    <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mr-2 sm:mr-3 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                      <BotIcon size={16} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 rounded-tl-xs border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-2 text-zinc-500">
                      <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </AnimatedListItem>
              )}
            </div>
          )}
        </div>

        {/* Input Area with Model Picker */}
        <div className="flex-none bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800 transition-colors safe-area-bottom">
          {/* Model Picker Dropdown */}
          {showModelPicker && (
            <div className="px-4 pt-3 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                <div className="px-3.5 py-2 border-b border-zinc-200/80 dark:border-zinc-800">
                  <p className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Select Model</p>
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
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {model.id.includes('0.5B') ? <BoltIcon size={14} /> : <CpuIcon size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{model.name}</span>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                              Loaded
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{model.description} · {model.size}</span>
                      </div>
                      {isSelected && <CheckIcon size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 max-w-3xl mx-auto">
              {/* Model Selector Button */}
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className={`
                  shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border
                  ${showModelPicker
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }
                `}
                title="Switch model"
              >
                {selectedModel.id.includes('0.5B') ? <BoltIcon size={14} /> : <CpuIcon size={14} />}
                <span className="hidden sm:inline">{selectedModel.name}</span>
                <AltArrowDownIcon size={12} className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
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
                  placeholder={isModelReady ? "Ask about your finances..." : "Load a model to chat..."}
                  className="
                    w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl
                    px-4 py-2.5 text-sm font-sans text-zinc-900 dark:text-zinc-100
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all
                    disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                  "
                />
              </div>

              {/* Send / Stop Button */}
              {isLoading ? (
                <button
                  onClick={() => { streamRef.current = false; setIsLoading(false); }}
                  className="
                    shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer
                  "
                  title="Stop"
                >
                  <div className="w-3 h-3 bg-white rounded-xs" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !isModelReady}
                  className="
                    shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                    bg-sky-600 hover:bg-sky-500 text-white shadow-xs
                  "
                >
                  <ArrowUpIcon size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
