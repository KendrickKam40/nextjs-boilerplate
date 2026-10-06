import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { sql } from '@/lib/db';
import { parseYouTubeLink } from '@/lib/youtube';

const MAX_VIDEOS = 50;


async function readPlaylist(): Promise<string[]> {
  const rows = (await sql`SELECT url FROM playlist_items ORDER BY position ASC`) as { url: string }[];
  return rows.map((r) => r.url);
}

async function writePlaylist(urls: string[]) {
  const positions = urls.map((_, idx) => idx);
  await sql.transaction([
    sql`DELETE FROM playlist_items`,
    urls.length
      ? sql`
          INSERT INTO playlist_items (position, url)
          SELECT * FROM UNNEST(${positions}::int4[], ${urls}::text[])
        `
      : sql`SELECT 1`,
  ]);
}

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const urls = await readPlaylist();
    return NextResponse.json({ videoUrls: urls });
  } catch (error) {
    console.error('[admin/video] playlist read failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'The video list can’t be loaded right now. Try again in a minute.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Something went wrong sending the list. Try saving again.' }, { status: 400 });
  }
  const rawList = body?.videoUrls;
  const cleaned = Array.isArray(rawList)
    ? rawList.map((v: unknown) => String(v ?? '').trim()).filter(Boolean)
    : [];
  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'Add at least one YouTube video before saving.' }, { status: 422 });
  }
  if (cleaned.length > MAX_VIDEOS) {
    return NextResponse.json({ error: `The store screen can hold up to ${MAX_VIDEOS} videos.` }, { status: 422 });
  }
  const problems = cleaned.flatMap((url, index) => {
    const link = parseYouTubeLink(url);
    return link.ok ? [] : [{ index, message: link.reason }];
  });
  if (problems.length) {
    return NextResponse.json(
      { error: problems.length === 1 ? 'One video link needs fixing.' : `${problems.length} video links need fixing.`, problems },
      { status: 422 },
    );
  }

  try {
    await writePlaylist(cleaned);
    return NextResponse.json({ ok: true, videoUrls: cleaned });
  } catch (error) {
    console.error('[admin/video] playlist write failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'The video list wasn’t saved. Try again in a minute.' }, { status: 503 });
  }
}
