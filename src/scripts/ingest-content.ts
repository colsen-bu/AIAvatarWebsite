import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getChromaClient, COLLECTION_NAME } from '../lib/chroma';

// Load environment variables from .env.local first, then fall back to .env
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });

// Validate environment variables
function validateEnv() {
  const required = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('\nMissing required environment variables:');
    console.error(missing.map(key => `- ${key}`).join('\n'));
    console.error(`\nPlease check your ${envPath} file and ensure all required variables are set.`);
    console.error('Required variables are listed in .env.example\n');
    process.exit(1);
  }
}

// Validate environment variables before proceeding
validateEnv();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentItem {
  content: string;
  metadata: any;
  source: string;
  type: string;
}

// Simple retry helper for transient network errors
async function withRetry<T = any>(fn: () => Promise<T>, label: string, attempts = 3, baseDelayMs = 500): Promise<T> {
  let lastErr: any;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const isFetchFailed = typeof err?.message === 'string' && err.message.includes('fetch failed');
      const code = (err as any)?.code || (err as any)?.cause?.code;
      const transient = isFetchFailed || ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(code as string);
      console.warn(`[${label}] attempt ${i}/${attempts} failed${code ? ` (code: ${code})` : ''}: ${err?.message || err}`);
      if (i < attempts && transient) {
        const delay = baseDelayMs * Math.pow(2, i - 1);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// Generate a consistent hash for content tracking
function generateContentHash(content: ContentItem): string {
  const contentString = `${content.source}:${content.type}:${content.content}`;
  return crypto.createHash('md5').update(contentString).digest('hex');
}

async function getEmbedding(text: string) {
  const response = await withRetry(
    () => openai.embeddings.create({ model: 'text-embedding-3-small', input: text }),
    'openai.embeddings.create'
  );
  return response.data[0].embedding;
}

async function processContent(content: ContentItem, options: IngestOptions) {
  try {
    const contentHash = generateContentHash(content);
    const chromaClient = getChromaClient();
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });

    const embedding = await getEmbedding(content.content);
    const enrichedMetadata = {
      ...content.metadata,
      content_hash: contentHash,
      last_updated: new Date().toISOString(),
      source: content.source,
      type: content.type,
    };

    // Upsert content
    await withRetry(
      async () => await collection.upsert({
        ids: [contentHash],
        embeddings: [embedding],
        metadatas: [enrichedMetadata],
        documents: [content.content],
      }),
      'chroma.collection.upsert'
    );

    console.log(`Processed content: ${content.source} (${content.type})`);
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error(`Error processing ${content.source}:`, {
      message: msg,
      hint: 'Ensure ChromaDB is running (docker-compose up -d chromadb).',
    });
  }
}

// Function to chunk text into smaller pieces
function chunkText(text: string, maxLength: number = 1000): string[] {
  const sentences = text.split(/[.!?]+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) chunks.push(currentChunk + '.');
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk + '.');
  return chunks;
}

// Process different content types
async function processMarkdownFile(filePath: string, type: string, options: IngestOptions) {
  console.log(`Processing markdown file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const chunks = chunkText(content);

  for (const [index, chunk] of chunks.entries()) {
    await processContent({
      content: chunk,
      metadata: { fileName, chunkIndex: index },
      source: fileName,
      type,
    }, options);
  }
}

async function processJSONResume(filePath: string, options: IngestOptions) {
  console.log('Processing resume...');
  const resume = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Add a comprehensive personal summary
  const personalSummary = `
    Christopher Olsen is a ${resume.basics?.label}. 
    ${resume.basics?.summary}
  `.trim();

  // Process each section with clear personal context
  const sections = {
    personal: personalSummary,
    skills: resume.skills?.map((s: any) => 
      `Christopher has expertise in ${s.name}, specifically with: ${s.keywords?.join(', ')}`
    ).join('. '),
    work: resume.work?.map((w: any) => 
      `Christopher worked as a ${w.position} at ${w.company} from ${w.startDate} to ${w.endDate}. ${w.summary}`
    ).join('\n\n'),
    education: resume.education?.map((e: any) =>
      `Christopher studied ${e.area} at ${e.institution}, earning a ${e.studyType} (${e.startDate} - ${e.endDate})`
    ).join('\n\n'),
  };

  for (const [section, content] of Object.entries(sections)) {
    if (content) {
      await processContent({
        content,
        metadata: {
          section,
          isPersonal: true,
          subject: "Christopher Olsen",
          contentType: "personal_info",
          source_type: "resume",
        },
        source: 'resume.json',
        type: 'resume',
      }, options);
    }
  }
}

async function processProjects(options: IngestOptions) {
  console.log('Processing projects...');
  const projects = JSON.parse(fs.readFileSync('data/projects.json', 'utf-8'));
  
  for (const project of projects) {
    const content = `
  Christopher Olsen developed this project:
      Project: ${project.name}
      Description: ${project.description}
      Technologies Used: ${project.technologies.join(', ')}
      Key Features: ${project.features.join(', ')}
      ${project.github_url ? `GitHub Repository: ${project.github_url}` : ''}
      ${project.live_url ? `Live Demo: ${project.live_url}` : ''}
    `.trim();

    await processContent({
      content,
      metadata: {
        projectId: project.id,
        isPersonal: true,
  subject: "Christopher Olsen",
        contentType: "project",
        source_type: "portfolio",
      },
      source: project.name,
      type: 'project',
    }, options);
  }
}

interface IngestOptions {
  clean: boolean;
  updateExisting: boolean;
}

// Main ingestion function
async function ingestContent(options: IngestOptions = { clean: false, updateExisting: true }) {
  try {
    console.log(`Starting content ingestion with options:`, options);

    if (options.clean) {
      console.log('Cleaning existing vector database...');
      try {
        const chromaClient = getChromaClient();
        await chromaClient.deleteCollection({ name: COLLECTION_NAME });
        console.log('Vector database cleaned successfully');
      } catch (e) {
        console.log('Collection does not exist, skipping clean.');
      }
    }

    // Ensure collection exists
    const chromaClient = getChromaClient();
    await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });

    // Process resume
    if (fs.existsSync('data/resume.json')) {
      await processJSONResume('data/resume.json', options);
    }

    // Process blog posts
    const blogDir = 'data/blog';
    if (fs.existsSync(blogDir)) {
      const blogPosts = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
      for (const post of blogPosts) {
        await processMarkdownFile(path.join(blogDir, post), 'blog', options);
      }
    }

    // Process projects
    if (fs.existsSync('data/projects.json')) {
      await processProjects(options);
    }

    console.log('Content ingestion complete!');
  } catch (error) {
    console.error('Error during content ingestion:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: IngestOptions = {
  clean: args.includes('--clean'),
  updateExisting: !args.includes('--no-update'),
};

// Run the ingestion
ingestContent(options); 