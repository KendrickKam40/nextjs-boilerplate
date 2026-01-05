// middleware.ts (project root: same level as /app or /pages)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Toggle the gate with an env var.
 * Prefer a non-public var for server-only (middleware runs on the edge runtime).
 */
const COMING_SOON_ENABLED = process.env.COMING_SOON === 'true';
const DISPLAY_PATH = `/${process.env.DISPLAY_PATH || 'store-display'}`;
const ADMIN_COOKIE = 'admin_session';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

/**
 * Allowlist:
 * - /coming-soon      the gate page
 * - /api              API routes
 * - /_next            Next.js internals (chunks, /_next/static, image optimizer)
 * - root files        e.g., /favicon.ico, /robots.txt, /sitemap.xml
 * - any asset-like path ending in ".<ext>"
 */
const PUBLIC_FILE = /\.(.*)$/;

function base64UrlToUint8Array(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 ? 4 - (normalized.length % 4) : 0;
  const padded = normalized + '='.repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyAdminToken(token: string | undefined | null) {
  if (!token || !ADMIN_SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [headerB64, payloadB64, sigB64] = parts;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const data = enc.encode(`${headerB64}.${payloadB64}`);
  const sig = base64UrlToUint8Array(sigB64);
  const ok = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!ok) return false;

  try {
    const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = json?.exp;
    const sub = json?.sub;
    if (sub !== 'admin') return false;
    if (typeof exp !== 'number' || exp < Date.now() / 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Protect admin pages and APIs with presence of session cookie (allow login endpoints)
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginPath = pathname === '/admin/login' || pathname === '/api/admin/login';
  if (isAdminArea && !isLoginPath) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    // Let authenticated admin traffic through
    return NextResponse.next();
  }

  if (!COMING_SOON_ENABLED) return NextResponse.next();

  // 1) Always let core/internal and explicit allowlist paths through
  if (
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === DISPLAY_PATH ||
    pathname.startsWith('/admin') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) Preview bypass via cookie
  const isPreview = req.cookies.get('preview')?.value === '1';
  if (isPreview) return NextResponse.next();

  // 3) (Optional) allow one-time query param to set preview cookie, then continue
  //    e.g. visit https://yoursite.com?preview=1 once to unlock
  if (searchParams.get('preview') === '1') {
    const res = NextResponse.next();
    res.cookies.set({
      name: 'preview',
      value: '1',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  }

  // 4) Rewrite everything else to /coming-soon (URL stays the same)
  const url = req.nextUrl.clone();
  url.pathname = '/coming-soon';
  return NextResponse.rewrite(url);
}

/**
 * Run on (almost) everything, but skip /api, /_next and public root files.
 * This avoids touching static assets and Next internals.
 *
 * The negative lookahead keeps important internals and root files out.
 */
export const config = {
  matcher: [
    // Match all paths except:
    //  - /api
    //  - /_next
    //  - root files like /favicon.ico, /robots.txt, etc.
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};
