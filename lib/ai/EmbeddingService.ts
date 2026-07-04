import { DataChunk } from './DataChunker';

export interface EmbeddingVector {
  chunkId: string;
  vector: Map<string, number>;
  magnitude: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
  'it', 'its', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
  'himself', 'she', 'her', 'hers', 'herself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'also',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

export class EmbeddingService {
  private idf: Map<string, number> = new Map();
  private corpusSize = 0;

  /**
   * Compute IDF values from a corpus of chunks.
   */
  buildIDF(chunks: DataChunk[]): void {
    this.idf.clear();
    this.corpusSize = chunks.length;

    const docFrequency = new Map<string, number>();

    for (const chunk of chunks) {
      const uniqueTokens = new Set(tokenize(chunk.text));
      for (const token of uniqueTokens) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    for (const [token, df] of docFrequency) {
      this.idf.set(token, Math.log((this.corpusSize + 1) / (df + 1)) + 1);
    }
  }

  /**
   * Create a TF-IDF embedding vector for a text.
   */
  embed(text: string): EmbeddingVector {
    const tokens = tokenize(text);
    const tf = new Map<string, number>();

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    const vector = new Map<string, number>();
    let magnitudeSq = 0;

    for (const [token, count] of tf) {
      const tfValue = count / Math.max(tokens.length, 1);
      const idfValue = this.idf.get(token) || 1;
      const tfidf = tfValue * idfValue;
      vector.set(token, tfidf);
      magnitudeSq += tfidf * tfidf;
    }

    return {
      chunkId: '',
      vector,
      magnitude: Math.sqrt(magnitudeSq),
    };
  }

  /**
   * Create embeddings for all chunks.
   */
  embedChunks(chunks: DataChunk[]): EmbeddingVector[] {
    this.buildIDF(chunks);

    return chunks.map(chunk => {
      const embedding = this.embed(chunk.text);
      return { ...embedding, chunkId: chunk.id };
    });
  }

  /**
   * Compute cosine similarity between two vectors.
   */
  static cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
    if (a.magnitude === 0 || b.magnitude === 0) return 0;

    let dotProduct = 0;
    for (const [token, value] of a.vector) {
      const bValue = b.vector.get(token);
      if (bValue !== undefined) {
        dotProduct += value * bValue;
      }
    }

    return dotProduct / (a.magnitude * b.magnitude);
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;
