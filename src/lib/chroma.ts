import { ChromaClient } from 'chromadb';

const chromaUrl = process.env.CHROMA_DB_URL || 'http://localhost:8000';

let chromaClientInstance: ChromaClient | null = null;

export function getChromaClient() {
  if (!chromaClientInstance) {
    chromaClientInstance = new ChromaClient({
      path: chromaUrl,
    });
  }
  return chromaClientInstance;
}

export const COLLECTION_NAME = 'portfolio_content';
