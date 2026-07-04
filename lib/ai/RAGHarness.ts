import { DashboardData } from '../repositories/DashboardRepository';
import { chunkDashboardData, DataChunk } from './DataChunker';
import { embeddingService } from './EmbeddingService';
import { vectorStore, SearchResult } from './VectorStore';

export interface RAGContext {
  chunks: SearchResult[];
  prompt: string;
  dataSummary: string;
}

class RAGHarnessImpl {
  private initialized = false;
  private lastDataHash = '';

  /**
   * Initialize the harness with IndexedDB persistence.
   */
  async init(): Promise<void> {
    await vectorStore.init();
    await vectorStore.loadFromDB();
    this.initialized = true;
  }

  /**
   * Hash dashboard data to detect changes.
   */
  private hashData(data: DashboardData): string {
    const parts = [
      data.expenses.map(e => `${e.id}-${e.amount}-${e.date.getTime()}`).join(','),
      data.sales.map(s => `${s.id}-${s.amount}-${s.dateReceived.getTime()}`).join(','),
      data.projects.map(p => `${p.id}-${p.status}-${p.startDate.getTime()}`).join(','),
      data.savings.map(s => `${s.id}-${s.amount}-${s.createdAt.getTime()}`).join(','),
    ];
    return parts.join('|');
  }

  /**
   * Ingest dashboard data into the vector store.
   * Only re-processes if data has changed.
   */
  async ingest(data: DashboardData): Promise<void> {
    if (!this.initialized) await this.init();

    const hash = this.hashData(data);
    if (hash === this.lastDataHash) return;

    const chunks = chunkDashboardData(data);
    const embeddings = embeddingService.embedChunks(chunks);

    vectorStore.upsert(chunks, embeddings);
    await vectorStore.saveToDB();

    this.lastDataHash = hash;
  }

  /**
   * Retrieve relevant context for a user query.
   * Returns ranked chunks and a formatted prompt.
   */
  retrieve(query: string, topK: number = 5): RAGContext {
    const queryEmbedding = embeddingService.embed(query);
    const results = vectorStore.search(queryEmbedding, topK);

    // Always include summary chunk if available
    const summaryChunk = results.find(r => r.chunk.type === 'summary');
    const otherChunks = results.filter(r => r.chunk.type !== 'summary');

    // Prioritize: summary first, then by score
    const finalChunks: SearchResult[] = [];
    if (summaryChunk) finalChunks.push(summaryChunk);

    for (const chunk of otherChunks) {
      if (finalChunks.length >= topK) break;
      if (!finalChunks.find(f => f.chunk.id === chunk.chunk.id)) {
        finalChunks.push(chunk);
      }
    }

    // Context engineering: build focused prompt
    const prompt = this.buildContextPrompt(query, finalChunks);

    // Data summary for transparency
    const dataSummary = this.buildDataSummary(finalChunks);

    return {
      chunks: finalChunks,
      prompt,
      dataSummary,
    };
  }

  /**
   * Build a focused system prompt with only relevant data.
   */
  private buildContextPrompt(query: string, results: SearchResult[]): string {
    if (results.length === 0) {
      return [
        "You are a financial assistant for 'Wenlance'.",
        "The user's question does not match any of their financial data.",
        "Politely decline and redirect: 'I can only help with your financial data — expenses, sales, projects, and savings. Please ask about those topics.'",
        "Do NOT answer unrelated questions (weather, recipes, coding, general knowledge, etc.).",
      ].join(' ');
    }

    let context = [
      "You are a financial assistant for 'Wenlance'.",
      "RULES:",
      "1. Answer ONLY based on the financial data provided below.",
      "2. Do NOT make up numbers, estimates, or data not shown here.",
      "3. If the data doesn't contain the answer, say 'I don't have that information in your financial records.'",
      "4. Do NOT answer questions unrelated to finances, expenses, sales, projects, or savings.",
      "5. For unrelated questions (weather, recipes, coding, general knowledge), respond: 'I can only help with your financial data — expenses, sales, projects, and savings.'",
      "6. Be concise and specific. Use the actual numbers from the data.",
      "",
      "RELEVANT DATA:",
      "",
    ].join('\n');

    // Group by type for organized output
    const byType = new Map<string, SearchResult[]>();
    for (const result of results) {
      const type = result.chunk.type;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type)!.push(result);
    }

    const typeLabels: Record<string, string> = {
      summary: 'FINANCIAL OVERVIEW',
      expense: 'EXPENSES',
      sale: 'SALES & SALARY',
      project: 'PROJECTS',
      savings: 'SAVINGS',
    };

    for (const [type, chunks] of byType) {
      const label = typeLabels[type] || type.toUpperCase();
      context += `--- ${label} ---\n`;
      for (const { chunk, score } of chunks) {
        context += `${chunk.text}\n`;
      }
      context += '\n';
    }

    return context;
  }

  /**
   * Build a summary of what data is being used (for transparency).
   */
  private buildDataSummary(results: SearchResult[]): string {
    if (results.length === 0) return 'No matching data found';

    const counts = { expense: 0, sale: 0, project: 0, savings: 0, summary: 0 };
    for (const { chunk } of results) {
      counts[chunk.type]++;
    }

    const parts: string[] = [];
    if (counts.summary) parts.push('Overview');
    if (counts.expense) parts.push(`${counts.expense} expense${counts.expense > 1 ? 's' : ''}`);
    if (counts.sale) parts.push(`${counts.sale} sale${counts.sale > 1 ? 's' : ''}`);
    if (counts.project) parts.push(`${counts.project} project${counts.project > 1 ? 's' : ''}`);
    if (counts.savings) parts.push(`${counts.savings} saving${counts.savings > 1 ? 's' : ''}`);

    return `Using: ${parts.join(', ')}`;
  }

  /**
   * Check if data is indexed.
   */
  get isReady(): boolean {
    return this.initialized && vectorStore.size > 0;
  }

  get totalChunks(): number {
    return vectorStore.size;
  }
}

export const ragHarness = new RAGHarnessImpl();
export default ragHarness;
