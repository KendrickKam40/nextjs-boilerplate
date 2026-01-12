import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminCookieName, verifySessionToken } from '@/lib/auth';
import {
  extractTheme,
  mergeTheme,
  readThemeOverrides,
  sanitizeThemeOverrides,
  writeThemeOverrides,
} from '@/lib/theme';

const UPSTREAM = process.env.MAXORDER_UPSTREAM || '';
const API_KEY = process.env.MAXORDER_API_KEY || '';
const CLIENT_ID = process.env.MAXORDER_CLIENT_ID || '';

const HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

const BODY = JSON.stringify({ clientId: CLIENT_ID });

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function requireUpstreamConfig() {
  if (!UPSTREAM || !API_KEY || !CLIENT_ID) {
    throw new Error('MAXORDER upstream config is not set');
  }
}

async function fetchPosClient() {
  requireUpstreamConfig();
  const res = await fetch(UPSTREAM, {
    method: 'POST',
    headers: HEADERS,
    body: BODY,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const data = (await res.json()) as Record<string, any>;
  return data.client ?? data ?? {};
}

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const [posClient, overrides] = await Promise.all([
      fetchPosClient(),
      readThemeOverrides(),
    ]);
    const posTheme = extractTheme(posClient);
    const effectiveTheme = mergeTheme(posTheme, overrides);
    return NextResponse.json({ posTheme, overrides, effectiveTheme });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body?.action === 'reset') {
    await writeThemeOverrides({});
    return NextResponse.json({ ok: true, overrides: {} });
  }

  const rawOverrides = body?.overrides ?? body ?? {};
  const sanitized = sanitizeThemeOverrides(rawOverrides);
  const saved = await writeThemeOverrides(sanitized);
  return NextResponse.json({ ok: true, overrides: saved });
}
