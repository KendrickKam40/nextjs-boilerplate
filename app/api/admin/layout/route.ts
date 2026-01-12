import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminCookieName, verifySessionToken } from '@/lib/auth';
import { DEFAULT_LAYOUTS, isPageKey } from '@/lib/layout-config';
import { listLayoutHistory, readCurrentLayout, restoreLayoutVersion, saveLayoutVersion } from '@/lib/layout';

function getPageKey(req: Request) {
  const url = new URL(req.url);
  const value = url.searchParams.get('page') || 'home';
  if (!isPageKey(value)) return null;
  return value;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const pageKey = getPageKey(req);
  if (!pageKey) {
    return NextResponse.json({ error: 'Invalid page key' }, { status: 400 });
  }

  try {
    const [current, history] = await Promise.all([
      readCurrentLayout(pageKey).catch(() => ({ versionId: null, layout: DEFAULT_LAYOUTS[pageKey] })),
      listLayoutHistory(pageKey),
    ]);

    return NextResponse.json({
      pageKey,
      current,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const pageKey = getPageKey(req);
  if (!pageKey) {
    return NextResponse.json({ error: 'Invalid page key' }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body?.action === 'restore') {
    const versionId = String(body?.versionId || '');
    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 422 });
    }
    const restored = await restoreLayoutVersion(pageKey, versionId);
    if (!restored) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, current: restored });
  }

  const layoutInput = body?.layout ?? body ?? {};
  const saved = await saveLayoutVersion(pageKey, layoutInput, 'admin');
  return NextResponse.json({ ok: true, current: saved });
}
