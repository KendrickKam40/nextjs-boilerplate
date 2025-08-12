// middleware.ts (project root: same level as /app or /pages)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Toggle the gate with an env var.
 * Prefer a non-public var for server-only (middleware runs on the edge runtime).
 */
const COMING_SOON_ENABLED = process.env.COMING_SOON === 'true';

/**
 * Allowlist:
 * - /coming-soon      the gate page
 * - /api              API routes
 * - /_next            Next.js internals (chunks, /_next/static, image optimizer)
 * - root files        e.g., /favicon.ico, /robots.txt, /sitemap.xml
 * - any asset-like path ending in ".<ext>"
 */
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
    console.log('Middleware running...');
  if (!COMING_SOON_ENABLED) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;

  // 1) Always let core/internal and explicit allowlist paths through
  if (
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
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