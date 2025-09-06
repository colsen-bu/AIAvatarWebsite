import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';

/*
 * Automated Supabase database bootstrap script.
 *
 * What it does:
 *  - Enables pgvector extension
 *  - Creates content_vectors table (if missing)
 *  - (Optionally) creates IVFFlat index (use --with-index after data exists)
 *  - Creates match_content_vectors RPC function
 *  - (Optionally) enables RLS + simple read policy (--with-rls)
 *
 * Requirements:
 *  - SUPABASE_DB_URL in your environment (.env.local recommended)
 *    Format: postgres://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
 *  - Your IP allowed (Project Settings > Database > Connection Pooling / Settings)
 *
 * Usage:
 *  npm run setup-supabase                # basic setup (no index yet)
 *  npm run setup-supabase -- --with-index # also create IVFFlat index (after rows exist)
 *  npm run setup-supabase -- --with-rls   # enable RLS + read policy
 *  npm run setup-supabase -- --with-index --with-rls
 */

interface Flags {
  withIndex: boolean;
  withRls: boolean;
}

function parseFlags(): Flags {
  const args = process.argv.slice(2);
  return {
    withIndex: args.includes('--with-index'),
    withRls: args.includes('--with-rls'),
  };
}

async function main() {
  const flags = parseFlags();
  const conn = process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('Missing SUPABASE_DB_URL. Add it to .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();
  console.log('Connected to Supabase Postgres');

  const statements: string[] = [];

  statements.push(`create extension if not exists vector;`);
  statements.push(`create table if not exists public.content_vectors (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    embedding vector(1536) not null,
    metadata jsonb default '{}'::jsonb,
    source text not null,
    type text not null,
    created_at timestamptz default now()
  );`);

  statements.push(`create or replace function public.match_content_vectors(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
  ) returns table (
    id uuid,
    content text,
    similarity float,
    metadata jsonb,
    source text,
    type text
  ) language plpgsql as $$
  begin
    return query
    select
      cv.id,
      cv.content,
      1 - (cv.embedding <=> query_embedding) as similarity,
      cv.metadata,
      cv.source,
      cv.type
    from public.content_vectors cv
    where 1 - (cv.embedding <=> query_embedding) > match_threshold
    order by cv.embedding <=> query_embedding
    limit match_count;
  end; $$;`);

  if (flags.withRls) {
    statements.push(`alter table public.content_vectors enable row level security;`);
    statements.push(`do $$ begin
      if not exists (
        select 1 from pg_policies where tablename = 'content_vectors' and policyname = 'Allow read'
      ) then
        create policy "Allow read" on public.content_vectors for select using (true);
      end if;
    end $$;`);
  }

  // Execute core statements
  for (const sql of statements) {
    console.log('\nExecuting:\n', sql);
    await client.query(sql);
  }

  if (flags.withIndex) {
    console.log('\nCreating IVFFlat index (ensure you already have data for best results)...');
    await client.query(`create index if not exists content_vectors_embedding_idx
      on public.content_vectors using ivfflat (embedding vector_cosine_ops)
      with (lists = 100);`);
  } else {
    console.log('\nSkipped IVFFlat index (use --with-index to create after initial ingestion).');
  }

  await client.end();
  console.log('\nSupabase setup complete.');
  console.log('Next steps:');
  console.log('  1. Run: npm run ingest-content');
  console.log('  2. Start dev server: npm run dev');
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
