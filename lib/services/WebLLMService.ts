import { CreateMLCEngine, prebuiltAppConfig, MLCEngine, ChatCompletionChunk, hasModelInCache } from '@mlc-ai/web-llm';
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import { DashboardData } from '../repositories/DashboardRepository';
import { ragHarness, RAGContext } from '../ai/RAGHarness';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  size: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 0.5B',
    description: 'Small & fast, good for quick tasks',
    size: '~300MB',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 8B',
    description: 'Best quality, more capable',
    size: '~5GB',
  },
];

export type LoadProgressCallback = (report: { text: string; progress: number }) => void;

class WebLLMServiceImpl {
  private engine: MLCEngine | null = null;
  private loadedModelId: string | null = null;
  private abortController: AbortController | null = null;

  get isWebGPUSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  get isModelLoaded(): boolean {
    return this.engine !== null && this.loadedModelId !== null;
  }

  get currentModel(): string | null {
    return this.loadedModelId;
  }

  /**
   * Initialize the RAG harness and ingest dashboard data.
   */
  async initRAG(data: DashboardData): Promise<void> {
    await ragHarness.init();
    await ragHarness.ingest(data);
  }

  /**
   * Get RAG context for a query.
   */
  getRAGContext(query: string): RAGContext {
    return ragHarness.retrieve(query);
  }

  /**
   * Get RAG status info.
   */
  getRAGStatus(): { ready: boolean; totalChunks: number } {
    return {
      ready: ragHarness.isReady,
      totalChunks: ragHarness.totalChunks,
    };
  }

  /**
   * Formats financial data into a compact system prompt for the LLM.
   */
  formatFinancialContext(data: DashboardData | null): string | undefined {
    if (!data) return undefined;

    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    const yearBeforeLast = currentYear - 2;
    const thisYearSales = data.sales.filter(s => s.dateReceived.getFullYear() === currentYear);
    const lastYearSales = data.sales.filter(s => s.dateReceived.getFullYear() === lastYear);
    const yearBeforeLastSales = data.sales.filter(s => s.dateReceived.getFullYear() === yearBeforeLast);
    const thisYearSalary = thisYearSales.reduce((sum, s) => sum + s.amount, 0);
    const lastYearSalary = lastYearSales.reduce((sum, s) => sum + s.amount, 0);
    const yearBeforeLastSalary = yearBeforeLastSales.reduce((sum, s) => sum + s.amount, 0);

    // Compact format to fit in small context windows (4096 tokens)
    let context = "Financial assistant for Wenlance. Answer ONLY from this data. Be brief. When listing items, use bullet points (•) format.\n\n";

    // Salary summary first (most common question)
    const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    context += `[SALARY SUMMARY]\n`;
    context += `- ${currentYear}: ${fmt(thisYearSalary)} from ${thisYearSales.length} sales\n`;
    context += `- ${lastYear}: ${fmt(lastYearSalary)} from ${lastYearSales.length} sales\n`;
    context += `- ${yearBeforeLast}: ${fmt(yearBeforeLastSalary)} from ${yearBeforeLastSales.length} sales\n\n`;

    if (data.projects.length > 0) {
      context += '[PROJECTS]\n';
      // List all project names compactly
      const projectNames = data.projects.map(p => {
        const name = p.projectName.length > 18 ? p.projectName.substring(0, 18) + '..' : p.projectName;
        return `${name} (${p.status})`;
      });
      context += `${data.projects.length} total: ${projectNames.join(', ')}\n\n`;
    }

    if (data.sales.length > 0) {
      context += '[SALES]\n';
      data.sales.forEach(s => {
        context += `• ${s.title}: ₱${s.amount.toLocaleString()} (${s.dateReceived.toLocaleDateString()})\n`;
      });
      context += '\n';
    }

    if (data.expenses.length > 0) {
      context += '[EXPENSES]\n';
      data.expenses.forEach(e => {
        context += `• ${e.title}: ₱${e.amount.toLocaleString()} (${e.date.toLocaleDateString()})\n`;
      });
      context += '\n';
    }

    if (data.savings.length > 0) {
      context += '[SAVINGS]\n';
      data.savings.forEach(s => {
        context += `• ${s.title}: ₱${s.amount.toLocaleString()}\n`;
      });
    }

    // Hard limit: truncate to ~4000 chars (fits in 4096 token window)
    if (context.length > 4000) {
      context = context.substring(0, 4000) + '\n... (truncated)';
    }

    return context;
  }

  /**
   * Check if a model is already cached in the browser.
   */
  async isModelCached(modelId: string): Promise<boolean> {
    try {
      return await hasModelInCache(modelId);
    } catch {
      return false;
    }
  }

  /**
   * Load a model into the browser. Downloads on first use, loads from cache after.
   */
  async loadModel(
    modelId: string,
    onProgress?: LoadProgressCallback
  ): Promise<void> {
    if (this.loadedModelId === modelId && this.engine) {
      return;
    }

    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.loadedModelId = null;
    }

    // Check if model is cached to show appropriate loading message
    const isCached = await this.isModelCached(modelId);

    this.engine = new MLCEngine({
      initProgressCallback: (report) => {
        onProgress?.({
          text: report.text,
          progress: report.progress,
        });
      },
    });

    await this.engine.reload(modelId);
    this.loadedModelId = modelId;
  }

  /**
   * Send a chat message and get a streaming response.
   * Uses RAG context engineering when data is available.
   * Returns an async iterable of chunks.
   */
  async *sendMessageStream({
    message,
    conversationHistory,
    systemContext,
  }: {
    message: string;
    conversationHistory?: { role: string; content: string }[];
    systemContext?: string;
  }): AsyncGenerator<string, void, void> {
    if (!this.engine || !this.loadedModelId) {
      throw new Error('No model loaded. Please load a model first.');
    }

    // Check if query is finance-related via RAG
    let ragResult = null;
    if (ragHarness.isReady) {
      ragResult = ragHarness.retrieve(message);

      // Block unrelated questions BEFORE they reach the LLM
      if (!ragResult.isFinanceRelated) {
        const refusal = "I can only help with your financial data — expenses, sales, projects, and savings. Please ask about those topics.";
        yield refusal;
        return;
      }
    }

    const messages: ChatCompletionMessageParam[] = [];

    // Use RAG context if available, otherwise fall back to raw context
    let finalContext = systemContext;
    if (ragResult && ragResult.prompt) {
      finalContext = ragResult.prompt;
    }

    if (finalContext && finalContext.trim() !== '') {
      messages.push({ role: 'system', content: finalContext });
    }

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const stream = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  /**
   * Send a chat message and get a complete response (non-streaming).
   * Uses RAG context engineering when data is available.
   */
  async sendMessage({
    message,
    conversationHistory,
    systemContext,
  }: {
    message: string;
    conversationHistory?: { role: string; content: string }[];
    systemContext?: string;
  }): Promise<string> {
    if (!this.engine || !this.loadedModelId) {
      throw new Error('No model loaded. Please load a model first.');
    }

    // Check if query is finance-related via RAG
    let ragResult = null;
    if (ragHarness.isReady) {
      ragResult = ragHarness.retrieve(message);

      // Block unrelated questions BEFORE they reach the LLM
      if (!ragResult.isFinanceRelated) {
        return "I can only help with your financial data — expenses, sales, projects, and savings. Please ask about those topics.";
      }
    }

    const messages: ChatCompletionMessageParam[] = [];

    // Use RAG context if available, otherwise fall back to raw context
    let finalContext = systemContext;
    if (ragResult && ragResult.prompt) {
      finalContext = ragResult.prompt;
    }

    if (finalContext && finalContext.trim() !== '') {
      messages.push({ role: 'system', content: finalContext });
    }

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const reply = await this.engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return reply.choices[0]?.message?.content || '';
  }

  /**
   * Unload the current model to free memory.
   */
  async unloadModel(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.loadedModelId = null;
    }
  }
}

export const webLLMService = new WebLLMServiceImpl();
export default webLLMService;
