import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // max requests per window
  cooldownMs: 1000, // 1 second between requests
};

// Store for rate limiting
const requestStore = new Map<string, { count: number; lastRequest: number }>();

// Rate limiting function
function isRateLimited(ip: string): { limited: boolean; message?: string } {
  const now = Date.now();
  const userRequests = requestStore.get(ip) || { count: 0, lastRequest: 0 };

  // Check cooldown
  if (now - userRequests.lastRequest < RATE_LIMIT.cooldownMs) {
    return { limited: true, message: 'Please wait a moment before sending another message.' };
  }

  // Reset count if window has passed
  if (now - userRequests.lastRequest > RATE_LIMIT.windowMs) {
    userRequests.count = 0;
  }

  // Check max requests
  if (userRequests.count >= RATE_LIMIT.maxRequests) {
    return { limited: true, message: 'Too many requests. Please try again later.' };
  }

  // Update request store
  requestStore.set(ip, {
    count: userRequests.count + 1,
    lastRequest: now,
  });

  return { limited: false };
}

// Create OpenAI client for embeddings
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Create Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContentMatch {
  id: string;
  content: string;
  similarity: number;
  metadata: any;
  source: string;
  type: string;
}

export async function POST(req: Request) {
  try {
    // Get IP address from headers or request
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimitCheck = isRateLimited(ip);
    if (rateLimitCheck.limited) {
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages } = await req.json();

    const provider = 'openai';
    // Use the correct model name for GPT-4o (just the model name, not the provider prefix)
    const modelName = 'gpt-4o-mini';  // Changed to mini model
    console.log(`Request received using model: ${modelName}`);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const lastMessage = messages[messages.length - 1];

    // Get embeddings for the last message
    const embedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastMessage.content,
    });

    // Search for relevant content in the vector store (limit results to keep prompt concise)
    const { data: matches, error: searchError } = await supabase.rpc('match_content_vectors', {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.2,
      match_count: 8,
    });

    if (searchError) {
      console.error('Vector search error:', searchError);
      return new Response(
        JSON.stringify({ error: 'Failed to search knowledge base' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Format relevant content for context (cap individual snippet length to avoid context overflow)
    const relevantContent = (matches as ContentMatch[] || [])
      .map((match) => {
        const snippet = (match.content || '').slice(0, 800);
        return `[${match.type}] ${snippet}${match.source ? ` (Source: ${match.source})` : ''}`;
      })
      .join('\n\n');
    const hasContext = relevantContent.trim().length > 0;

    // Create the system message
    const systemMessage = {
      role: "system",
      content: `You are Christopher Olsen, a full-stack developer specializing in Biotech, Web Dev, and Therapeutics Research. You're having a conversation with someone who wants to get to know you.

Key guidelines:
1. Always respond as Christopher in first person ("I think...", "In my experience...")
2. NEVER say "I am an AI" or mention being an assistant - you ARE Christopher
3. For questions about your background/work: Use the provided context when available
4. For general questions (like restaurant recommendations, opinions, etc.): Answer thoughtfully as yourself, drawing on your expertise and interests. Be conversational and helpful.
5. If you don't know something specific, just say "I'm not sure about that" or "I don't have experience with that" - don't refuse to answer
6. Always provide at least one substantive sentence; never return empty responses
7. Be friendly, engaging, and helpful
8. Format responses using markdown when appropriate

Context about you:
${hasContext ? relevantContent : '(No specific context found in knowledge base for this query - answer based on your general knowledge and expertise.)'}`
    };

    // Add system message to the beginning of the messages array
    const augmentedMessages = [systemMessage, ...messages];  // Create OpenAI provider to obtain a LanguageModelV1 instance
  const openaiProvider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const result = streamText({
        model: openaiProvider(modelName),
        messages: augmentedMessages,
        temperature: 0.5,
        maxTokens: 800,
      });

      console.log('Stream created successfully, returning response');
      return result.toDataStreamResponse();
    } catch (openaiError: any) {
      console.error('Error creating OpenAI stream:', openaiError);
      
      // Enhanced error logging
      console.error('Full OpenAI error details:', {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type,
        response: openaiError.response
      });
      
      // Handle specific errors
      if (openaiError.status === 404 || openaiError.message?.includes('model')) {
        return new Response(
          JSON.stringify({ 
            error: `Model '${modelName}' not found. Make sure you're using AI SDK v5 and have access to GPT-5.`,
            suggestion: 'Try updating AI SDK: npm install ai@latest @ai-sdk/openai@latest'
          }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw openaiError;
    }
  } catch (error) {
    console.error('Chat API error:', error);
    let errorMessage = 'Failed to process chat request';
    let statusCode = 500;
    let errorDetails: Record<string, any> = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
      };
      if (errorMessage.includes('API key')) {
        errorMessage = 'Invalid or missing API key. Please check your configuration.';
        statusCode = 401;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (errorMessage.includes('not found') || errorMessage.includes('invalid model')) {
        errorMessage = 'The requested model is not available or invalid.';
        statusCode = 404;
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        provider: 'openai',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}