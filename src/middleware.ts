import { NextRequest, NextResponse } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret';
const SESSION_COOKIE = 'cc_session';

async function verify(signed: string): Promise<boolean> {
  const idx = signed.lastIndexOf('.');
  if (idx === -1) return false;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return expected === sig;
}

// Routes that don't need auth
const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];
// API routes that external agents can access (Orion)
const agentApiPaths = ['/api/leads', '/api/analytics'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some(p => pathname === p)) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Allow agent API paths (they're meant for external programmatic access)
  if (agentApiPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth
  const session = req.cookies.get(SESSION_COOKIE);
  if (!session || !(await verify(session.value))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
