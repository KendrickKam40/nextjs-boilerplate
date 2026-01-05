import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSessionToken, getAdminCookieName, requireSecrets } from '@/lib/auth';

// simple in-memory throttle (per instance)
const attempts: Record<string, { count: number; resetAt: number }> = {};
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = attempts[ip] || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    attempts[ip] = { count: 0, resetAt: now + WINDOW_MS };
    return { allowed: true };
  }
  if (entry.count >= MAX_ATTEMPTS) return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  attempts[ip] = { ...entry, count: entry.count + 1 };
  return { allowed: true };
}

export async function POST(req: Request) {
  try {
    requireSecrets();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const password = process.env.ADMIN_PASSWORD || '';
  if (!password) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD is not set' }, { status: 500 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const supplied = (body?.password || '').toString();
  if (supplied !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 2 * 60 * 60, // 2h
  });

  return NextResponse.json({ ok: true });
}
