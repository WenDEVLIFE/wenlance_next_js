import { CreateMLCEngine, prebuiltAppConfig, MLCEngine, ChatCompletionChunk } from '@mlc-ai/web-llm';
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
   * Formats financial data into a system prompt for the LLM (fallback when RAG not available).
   */
  formatFinancialContext(data: DashboardData | null): string | undefined {
    if (!data) return undefined;

    let context = "You are a helpful financial assistant for 'Wenlance'. Here is the user's current project, financial and expense data:\n\n";

    context += 'PROJECTS:\n';
    data.projects.forEach(p => {
      context += `- ${p.projectName} (${p.status})\n`;
    });

    context += '\nSALES & SALARY:\n';
    data.sales.forEach(s => {
      context += `- ${s.title} (${s.category}): ${s.amount} on ${s.dateReceived}\n`;
    });

    context += '\nEXPENSES:\n';
    data.expenses.forEach(e => {
      context += `- ${e.title} (${e.category}): ${e.amount} on ${e.date}\n`;
    });

    context += '\nSAVINGS:\n';
    data.savings.forEach(s => {
      context += `- ${s.title} (${s.category}): Target ${s.amount}\n`;
    });

    context += '\nPlease use these ACTUAL numbers when the user asks about their finances. Be concise.';
    return context;
  }

  /**
   * Load a model into the browser. Downloads on first use, cached after.
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

    const messages: ChatCompletionMessageParam[] = [];

    // Use RAG context if available, otherwise fall back to raw context
    let finalContext = systemContext;
    if (ragHarness.isReady) {
      const ragResult = ragHarness.retrieve(message);
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

    const messages: ChatCompletionMessageParam[] = [];

    // Use RAG context if available, otherwise fall back to raw context
    let finalContext = systemContext;
    if (ragHarness.isReady) {
      const ragResult = ragHarness.retrieve(message);
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
