import { DashboardData } from '../repositories/DashboardRepository';
import { chunkDashboardData, DataChunk } from './DataChunker';
import { embeddingService } from './EmbeddingService';
import { vectorStore, SearchResult } from './VectorStore';

export interface RAGContext {
  chunks: SearchResult[];
  prompt: string;
  dataSummary: string;
  isFinanceRelated: boolean;
}

// Keywords that indicate a finance-related question
const FINANCE_KEYWORDS = [
  // English
  'expense', 'expenses', 'spend', 'spent', 'spending', 'cost', 'costs', 'costing',
  'salary', 'income', 'revenue', 'earning', 'earnings', 'pay', 'payment', 'payments',
  'sale', 'sales', 'sold', 'profit', 'loss', 'balance', 'budget', 'budgeting',
  'savings', 'saving', 'bank', 'account', 'accounts', 'money', 'cash', 'fund', 'funds',
  'project', 'projects', 'client', 'clients', 'freelance', 'work', 'works', 'job', 'jobs',
  'total', 'sum', 'average', 'amount', 'amounts', 'price', 'pricing',
  'category', 'categories', 'description', 'date', 'when', 'how much',
  'financial', 'finance', 'money', 'debt', 'loan', 'investment', 'invest',
  'tax', 'taxes', 'invoice', 'invoices', 'bill', 'bills', 'due', 'owed',
  'report', 'summary', 'overview', 'breakdown', 'track', 'tracking',
  // Filipino/Tagalog
  'gastos', 'sweldo', 'kita', 'pera', 'ipon', 'save', 'income', 'babayaran',
  'utang', 'bayad', 'negosyo', 'trabaho', 'kliyente', 'proyekto',
  // Cebuano/Visayan
  'gasto', 'sweldo', 'kita', 'kwarta', 'padulngan', 'trabaho',
];

// Patterns that indicate NON-finance questions
const NON_FINANCE_PATTERNS = [
  'recipe', 'cook', 'cooking', 'food', 'ingredient', 'ingredients',
  'adobo', 'sinigang', 'tinola', 'lechon', 'kare-kare', 'pad thai',
  'pizza', 'pasta', 'burger', 'sushi', 'ramen', ' steak',
  'weather', 'temperature', 'rain', 'sunny', 'storm', 'typhoon',
  'song', 'music', 'movie', 'film', 'actor', 'actress', 'singer',
  'game', 'play', 'gaming', 'nba', 'basketball', 'soccer', 'football',
  'poem', 'poetry', 'story', 'novel', 'book', 'author',
  'code', 'coding', 'programming', 'javascript', 'python', 'react',
  'love', 'relationship', 'dating', 'girlfriend', 'boyfriend',
  'joke', 'funny', 'humor', 'laugh',
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'how are you', 'how do you do', 'what are you',
  'meaning of life', 'philosophy', 'religion', 'god',
  'exercise', 'workout', 'gym', 'diet', 'health', 'medical',
  'travel', 'tourism', 'hotel', 'flight', 'airline',
];

/**
 * Check if a query is related to finance/work.
 */
function isFinanceRelated(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Very short queries (1-2 words) - check if they match finance keywords
  if (lower.split(/\s+/).length <= 2) {
    return FINANCE_KEYWORDS.some(kw => lower.includes(kw));
  }

  // Check for non-finance patterns first (strong signal)
  const nonFinanceMatches = NON_FINANCE_PATTERNS.filter(p => lower.includes(p));
  if (nonFinanceMatches.length > 0) {
    // If it matches non-finance patterns AND doesn't match finance keywords, reject
    const financeMatches = FINANCE_KEYWORDS.filter(kw => lower.includes(kw));
    if (financeMatches.length === 0) {
      return false;
    }
  }

  // Check for finance keywords
  return FINANCE_KEYWORDS.some(kw => lower.includes(kw));
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
  retrieve(query: string, topK: number = 3): RAGContext {
    const related = isFinanceRelated(query);

    if (!related) {
      return {
        chunks: [],
        prompt: '',
        dataSummary: '',
        isFinanceRelated: false,
      };
    }

    const queryEmbedding = embeddingService.embed(query);
    const results = vectorStore.search(queryEmbedding, topK + 1);

    // Always include summary chunk if available
    const summaryChunk = results.find(r => r.chunk.type === 'summary');
    const otherChunks = results.filter(r => r.chunk.type !== 'summary');

    // Prioritize: summary first, then by score
    const finalChunks: SearchResult[] = [];
    if (summaryChunk) finalChunks.push(summaryChunk);

    for (const chunk of otherChunks) {
      if (finalChunks.length >= topK + 1) break;
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
      isFinanceRelated: true,
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
        "Politely decline: 'I can only help with your financial data — expenses, sales, projects, and savings.'",
      ].join(' ');
    }

    // Build compact context - keep it under ~2000 chars to fit in 4096 token window
    let context = "Financial assistant for Wenlance. Answer ONLY from this data. Be brief.\n\n";

    // ALWAYS include summary first (has totals/counts)
    const summaryChunk = results.find(r => r.chunk.type === 'summary');
    if (summaryChunk) {
      context += `[OVERVIEW]\n${summaryChunk.chunk.text}\n`;
    }

    // Group non-summary chunks by type
    const byType = new Map<string, SearchResult[]>();
    for (const result of results) {
      if (result.chunk.type === 'summary') continue;
      const type = result.chunk.type;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type)!.push(result);
    }

    const typeLabels: Record<string, string> = {
      expense: 'EXPENSES',
      sale: 'SALES',
      project: 'PROJECTS',
      savings: 'SAVINGS',
    };

    for (const [type, chunks] of byType) {
      const label = typeLabels[type] || type.toUpperCase();
      context += `[${label}]\n`;
      for (const { chunk } of chunks) {
        // Others truncated to 150 chars
        const text = chunk.text.length > 150 ? chunk.text.substring(0, 150) + '...' : chunk.text;
        context += `${text}\n`;
      }
    }

    // Hard limit: truncate entire context to ~2500 chars (~1000 tokens)
    if (context.length > 2500) {
      context = context.substring(0, 2500) + '...';
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
