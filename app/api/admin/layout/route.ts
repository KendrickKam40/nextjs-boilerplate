import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { ANNOUNCEMENT_SECTION, DEFAULT_LAYOUTS, SITE_LAYOUT_TAG, isPageKey, normalizeLayout } from '@/lib/layout-config';
import { listLayoutHistory, readCurrentLayout, restoreLayoutVersion, saveLayoutVersion } from '@/lib/layout';

function getPageKey(req: Request) {
  const url = new URL(req.url);
  const value = url.searchParams.get('page') || 'home';
  if (!isPageKey(value)) return null;
  return value;
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
  } catch (error) {
    console.error('[admin/layout] read failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'The homepage layout can’t be loaded right now. Try again in a minute.' }, { status: 503 });
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
    return NextResponse.json({ error: 'Something went wrong sending the layout. Try saving again.' }, { status: 400 });
  }

  try {
    if (body?.action === 'restore') {
      const versionId = String(body?.versionId || '');
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionId)) {
        return NextResponse.json({ error: 'That saved version couldn’t be found. Refresh the page and try again.' }, { status: 422 });
      }
      const restored = await restoreLayoutVersion(pageKey, versionId);
      if (!restored) {
        return NextResponse.json({ error: 'That saved version couldn’t be found. Refresh the page and try again.' }, { status: 404 });
      }
      revalidateTag(SITE_LAYOUT_TAG);
      return NextResponse.json({ ok: true, current: restored });
    }

    const layoutInput = body?.layout ?? body ?? {};
    const chapters = normalizeLayout(layoutInput, pageKey).items.filter(
      (item) => item.id !== ANNOUNCEMENT_SECTION && item.enabled,
    );
    if (chapters.length === 0) {
      return NextResponse.json({ error: 'Show at least one homepage section. Otherwise the homepage is just the headline.' }, { status: 422 });
    }
    const saved = await saveLayoutVersion(pageKey, layoutInput, 'admin');
    revalidateTag(SITE_LAYOUT_TAG);
    return NextResponse.json({ ok: true, current: saved });
  } catch (error) {
    console.error('[admin/layout] write failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'The layout wasn’t saved. Try again in a minute.' }, { status: 503 });
  }
}
