import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSessionToken, getAdminCookieName, requireSecrets } from '@/lib/auth';

// Simple in-memory throttle (per instance). Only wrong passwords count, so staff
// sharing the shop's network don't lock each other out by signing in.
const failures: Record<string, { count: number; resetAt: number }> = {};
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;

function clientKey(req: Request) {
  // Vercel sets x-real-ip and overwrites x-forwarded-for with the client address.
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return req.headers.get('x-real-ip') || forwarded || 'local';
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = failures[key];
  if (!entry || now > entry.resetAt) return { allowed: true };
  if (entry.count >= MAX_FAILURES) return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  return { allowed: true };
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = failures[key];
  failures[key] =
    !entry || now > entry.resetAt
      ? { count: 1, resetAt: now + WINDOW_MS }
      : { ...entry, count: entry.count + 1 };
}

export async function POST(req: Request) {
  const notSetUp = NextResponse.json(
    { error: 'Sign-in isn’t set up on this website yet. Ask whoever manages the website to finish setting it up.' },
    { status: 500 },
  );
  try {
    requireSecrets();
  } catch (err: any) {
    console.error('[admin/login]', err?.message);
    return notSetUp;
  }

  const password = process.env.ADMIN_PASSWORD || '';
  if (!password) {
    console.error('[admin/login] ADMIN_PASSWORD is not set');
    return notSetUp;
  }

  const key = clientKey(req);
  const rate = checkRateLimit(key);
  if (!rate.allowed) {
    const minutes = Math.max(1, Math.ceil((rate.retryAfter ?? 60) / 60));
    return NextResponse.json(
      { error: `Too many tries. Wait ${minutes} minute${minutes === 1 ? '' : 's'}, then try again.` },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter ?? 60) } },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Try signing in again.' }, { status: 400 });
  }
  const supplied = (body?.password || '').toString();
  if (supplied !== password) {
    recordFailure(key);
    return NextResponse.json({ error: 'That password didn’t work. Check it and try again.' }, { status: 401 });
  }

  delete failures[key];
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 2 * 60 * 60, // 2h
  });

  return NextResponse.json({ ok: true });
}
