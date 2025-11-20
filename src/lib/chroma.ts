import { ChromaClient } from 'chromadb';

const chromaUrl = process.env.CHROMA_DB_URL || 'http://localhost:8000';

export const chromaClient = new ChromaClient({
  path: chromaUrl,
});

export const COLLECTION_NAME = 'portfolio_content';
