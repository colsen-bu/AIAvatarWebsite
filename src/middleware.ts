import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PAGES_PASSWORD = process.env.PAGES_PASSWORD || '';
const COOKIE_NAME = 'pages_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /pages routes (but not /pages/login)
  if (pathname.startsWith('/pages') && !pathname.startsWith('/pages/login')) {
    const token = request.cookies.get(COOKIE_NAME);

    if (!token || !PAGES_PASSWORD) {
      // Redirect to login page
      const loginUrl = new URL('/pages/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate token
    try {
      const decoded = Buffer.from(token.value, 'base64').toString();
      const isValid = decoded.endsWith(`_${PAGES_PASSWORD}`);
      
      if (!isValid) {
        const loginUrl = new URL('/pages/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/pages/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/pages/:path*'],
}; 