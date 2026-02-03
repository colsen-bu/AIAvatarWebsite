import OpenAI from 'openai';
import { getChromaClient, COLLECTION_NAME } from './chroma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function searchVectors(embedding: number[], threshold = 0.7, count = 5) {
  const chromaClient = getChromaClient();
  const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: count,
  });

  // Transform Chroma results to match the expected format
  // Chroma returns arrays of arrays (one for each query)
  const matches = results.ids[0]?.map((id, index) => ({
    id,
    content: results.documents[0]?.[index] ?? '',
    metadata: results.metadatas[0]?.[index] ?? {},
    similarity: 1 - (results.distances?.[0]?.[index] ?? 0), // Approximation if using cosine distance
  })) ?? [];

  return matches;
}

export async function isPersonalQuestion(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an AI designed to determine if a question is asking for personal information about the portfolio owner. Respond with "true" if the question is asking about personal information, experiences, projects, or opinions, and "false" if it\'s a general question. Only respond with "true" or "false".'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0,
  });

  return response.choices[0].message.content?.toLowerCase() === 'true';
}

export async function generateResponse(
  question: string,
  relevantContent: Array<{ content: string; source: string; type: string }> = []
) {
  const systemPrompt = relevantContent.length > 0
    ? `You are an AI assistant representing the portfolio owner. Use the following information to answer questions about them. Only use this information and don't make up details. If you don't have enough information to answer, say so.

Relevant information:
${relevantContent.map(c => `[${c.type} from ${c.source}]: ${c.content}`).join('\n\n')}`
    : `You are an AI assistant for a portfolio website. For questions not about the portfolio owner, provide helpful, general responses. For personal questions, explain that you don't have specific information about that topic.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'I apologize, but I was unable to generate a response.';
} 