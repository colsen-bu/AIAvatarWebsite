import { NextResponse } from 'next/server';

// Plain-text ultra-lightweight health endpoint (no JSON parsing needed)
export async function GET() {
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
}
