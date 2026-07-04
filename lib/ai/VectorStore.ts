import { DataChunk } from './DataChunker';
import { EmbeddingVector, EmbeddingService } from './EmbeddingService';

export interface SearchResult {
  chunk: DataChunk;
  score: number;
}

interface StoredEntry {
  chunk: DataChunk;
  embedding: { chunkId: string; vector: [string, number][]; magnitude: number };
}

const DB_NAME = 'wenlance-vector-store';
const DB_VERSION = 1;
const STORE_NAME = 'embeddings';

class VectorStore {
  private entries: StoredEntry[] = [];
  private db: IDBDatabase | null = null;

  get size(): number {
    return this.entries.length;
  }

  /**
   * Initialize IndexedDB for persistence.
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'chunk.id' });
        }
      };
    });
  }

  /**
   * Load entries from IndexedDB.
   */
  async loadFromDB(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        this.entries = request.result || [];
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save all entries to IndexedDB.
   */
  async saveToDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();

      for (const entry of this.entries) {
        store.put(entry);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clear all data from the store.
   */
  async clear(): Promise<void> {
    this.entries = [];
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }

  /**
   * Add or update chunks with their embeddings.
   */
  upsert(chunks: DataChunk[], embeddings: EmbeddingVector[]): void {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      const vectorArray: [string, number][] = [];
      embedding.vector.forEach((value, key) => {
        vectorArray.push([key, value]);
      });

      const existingIndex = this.entries.findIndex(e => e.chunk.id === chunk.id);
      const entry: StoredEntry = {
        chunk,
        embedding: {
          chunkId: chunk.id,
          vector: vectorArray,
          magnitude: embedding.magnitude,
        },
      };

      if (existingIndex >= 0) {
        this.entries[existingIndex] = entry;
      } else {
        this.entries.push(entry);
      }
    }
  }

  /**
   * Search for similar chunks using cosine similarity.
   * Returns top-K results sorted by score descending.
   */
  search(queryEmbedding: EmbeddingVector, topK: number = 5): SearchResult[] {
    const queryVector = new Map(queryEmbedding.vector);

    const results: SearchResult[] = this.entries.map(entry => {
      const storedVector = new Map<string, number>(entry.embedding.vector);
      const magnitude = entry.embedding.magnitude;

      const storedEmbedding: EmbeddingVector = {
        chunkId: entry.chunk.id,
        vector: storedVector,
        magnitude,
      };

      const score = EmbeddingService.cosineSimilarity(queryEmbedding, storedEmbedding);

      return {
        chunk: entry.chunk,
        score,
      };
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Remove entries by chunk IDs.
   */
  remove(chunkIds: string[]): void {
    const idSet = new Set(chunkIds);
    this.entries = this.entries.filter(e => !idSet.has(e.chunk.id));
  }
}

export const vectorStore = new VectorStore();
export default vectorStore;
