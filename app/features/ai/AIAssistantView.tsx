'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Trash2, AlertCircle, X, MessageSquare, Send, User, Download, Cpu, ChevronDown, WifiOff, Database } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { dashboardRepository, DashboardData } from '@/lib/repositories/DashboardRepository';
import { webLLMService, AVAILABLE_MODELS, ModelOption } from '@/lib/services/WebLLMService';
import { ragHarness, RAGContext } from '@/lib/ai/RAGHarness';
import AppColors from '@/lib/utils/colors';

type ViewState = 'select' | 'loading' | 'ready';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ragContext?: RAGContext;
}

export default function AIAssistantView() {
  const [viewState, setViewState] = useState<ViewState>(
    webLLMService.isModelLoaded ? 'ready' : 'select'
  );
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    const current = webLLMService.currentModel;
    if (current) {
      return AVAILABLE_MODELS.find(m => m.id === current) || AVAILABLE_MODELS[0];
    }
    return AVAILABLE_MODELS[0];
  });
  const [loadProgress, setLoadProgress] = useState({ text: '', progress: 0 });
  const [isCached, setIsCached] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<boolean>(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [ragStatus, setRagStatus] = useState({ ready: false, totalChunks: 0 });

  useEffect(() => {
    const unsubscribe = dashboardRepository.listenToDashboard(async (data) => {
      setDashboardData(data);
      // Initialize RAG with the latest data
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

  const handleLoadModel = async () => {
    if (!webLLMService.isWebGPUSupported) {
      setError('WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.');
      return;
    }

    // Check if model is already cached
    const cached = await webLLMService.isModelCached(selectedModel.id);
    setIsCached(cached);

    setViewState('loading');
    setLoadProgress({ text: cached ? 'Loading from cache...' : 'Preparing download...', progress: 0 });
    setError(null);

    try {
      await webLLMService.loadModel(selectedModel.id, (report) => {
        setLoadProgress(report);
      });
      setViewState('ready');
    } catch (err: any) {
      console.error('Model load error:', err);
      setError(err.message || 'Failed to load model');
      setViewState('select');
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading || viewState !== 'ready') return;

    // Get RAG context for this query
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
  }, [inputText, isLoading, viewState, messages, systemContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleStopGeneration = () => {
    streamRef.current = false;
    setIsLoading(false);
  };

  const webGPUSupported = webLLMService.isWebGPUSupported;

  return (
    <PageTransition>
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
                  {viewState === 'ready'
                    ? `Running ${selectedModel.name} locally`
                    : viewState === 'loading'
                    ? 'Loading model...'
                    : 'Runs locally in your browser'}
                  {ragStatus.ready && ` · ${ragStatus.totalChunks} chunks indexed`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {viewState === 'ready' && messages.length > 0 && (
                <button
                  onClick={handleClearChat}
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
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-red-500">
              <X size={16} />
            </button>
          </div>
        )}

        {/* WebGPU Warning */}
        {!webGPUSupported && viewState === 'select' && (
          <div className="m-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex gap-3 z-10">
            <WifiOff className="text-amber-500 flex-shrink-0" size={20} />
            <div className="flex flex-col text-sm text-amber-700 dark:text-amber-400 font-sans">
              <strong>WebGPU Not Supported</strong>
              <p>This browser does not support WebGPU. Please use Chrome 113+ or Edge 113+ to run local AI models.</p>
            </div>
          </div>
        )}

        {/* Model Selection Screen */}
        {viewState === 'select' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
            <div className="w-full bg-white dark:bg-[#023E8A] rounded-2xl shadow-lg border border-zinc-100 dark:border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-white/10 rounded-xl">
                  <Cpu size={22} className="text-blue-600 dark:text-[#48CAE4]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Select Model</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Models run 100% in your browser</p>
                </div>
              </div>

              {/* Model Selector */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-white/5 text-left transition-colors hover:border-blue-400 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">{selectedModel.name}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{selectedModel.description} — {selectedModel.size}</span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#023E8A] border border-zinc-200 dark:border-white/10 rounded-xl shadow-lg z-10 overflow-hidden">
                    {AVAILABLE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full flex flex-col px-4 py-3 text-left transition-colors cursor-pointer ${
                          selectedModel.id === model.id
                            ? 'bg-blue-50 dark:bg-white/10'
                            : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="font-semibold text-zinc-900 dark:text-white">{model.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{model.description} — {model.size}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleLoadModel}
                disabled={!webGPUSupported}
                className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download & Start
              </button>
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {viewState === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
            <div className="w-full bg-white dark:bg-[#023E8A] rounded-2xl shadow-lg border border-zinc-100 dark:border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-white/10 rounded-xl animate-pulse">
                  <Cpu size={22} className="text-blue-600 dark:text-[#48CAE4]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Loading {selectedModel.name}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isCached ? 'Loading from cache...' : 'First download may take a few minutes'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-[#0096C7] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(loadProgress.progress * 100, 2)}%` }}
                />
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center truncate">
                {loadProgress.text || 'Preparing...'}
              </p>
            </div>
          </div>
        )}

        {/* Chat Area */}
        {viewState === 'ready' && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <MessageSquare size={64} className="text-zinc-300 dark:text-zinc-600 mb-6" />
                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 font-sans mb-2">
                  Start a conversation
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-sans mb-4">
                  Ask anything — the AI runs locally on your device
                </p>
                {ragStatus.ready && (
                  <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-sans flex items-center gap-1.5">
                      <Database size={12} />
                      {ragStatus.totalChunks} data chunks indexed for smart retrieval
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6 pb-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <AnimatedListItem key={idx} index={idx} delay={0.05} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                          ? 'bg-blue-100 dark:bg-blue-900/30 ml-3'
                          : 'bg-blue-100 dark:bg-white/10 mr-3'
                          }`}>
                          {isUser
                            ? <User size={16} className="text-blue-600 dark:text-[#48CAE4]" />
                            : <Bot size={16} className="text-blue-600 dark:text-[#48CAE4]" />
                          }
                        </div>

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
                      {/* RAG Context Indicator */}
                      {!isUser && msg.ragContext && msg.ragContext.chunks.length > 0 && (
                        <div className="mt-1.5 ml-11 flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                          <Database size={10} />
                          <span>{msg.ragContext.dataSummary}</span>
                        </div>
                      )}
                    </AnimatedListItem>
                  );
                })}

                {/* Typing Indicator */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
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
        )}

        {/* Input Area */}
        {viewState === 'ready' && (
          <div className="flex-none bg-white dark:bg-[#023E8A] border-t border-zinc-100 dark:border-white/10 p-4 transition-colors">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Type your message..."
                className="
                  flex-1 bg-zinc-100 dark:bg-white/5 border-none rounded-full
                  px-5 py-3.5 text-[15px] font-sans text-zinc-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
                  disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                "
              />
              {isLoading ? (
                <button
                  onClick={handleStopGeneration}
                  className="
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                    bg-red-500 hover:bg-red-600 text-white shadow-md cursor-pointer
                  "
                  title="Stop generation"
                >
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-blue-600 hover:bg-blue-700 text-white shadow-md
                  "
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
