import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PAGES_PASSWORD = process.env.PAGES_PASSWORD || '';
const COOKIE_NAME = 'pages_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!PAGES_PASSWORD) {
      return NextResponse.json(
        { error: 'Pages password not configured' },
        { status: 500 }
      );
    }

    if (password === PAGES_PASSWORD) {
      // Create a simple token (in production, use a more secure method)
      const token = Buffer.from(`${Date.now()}_${PAGES_PASSWORD}`).toString('base64');
      
      const response = NextResponse.json({ success: true });
      
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  if (!token || !PAGES_PASSWORD) {
    return NextResponse.json({ authenticated: false });
  }

  // Validate token contains the correct password hash
  try {
    const decoded = Buffer.from(token.value, 'base64').toString();
    const isValid = decoded.endsWith(`_${PAGES_PASSWORD}`);
    return NextResponse.json({ authenticated: isValid });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
