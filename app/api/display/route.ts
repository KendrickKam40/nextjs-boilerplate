import { NextResponse } from 'next/server';
import { readDisplayPlaylist } from '@/lib/display';

export const dynamic = 'force-dynamic';

// Public, read-only: the store screen polls this to pick up playlist edits
// and recover from outages without anyone reloading it.
export async function GET() {
  const playlist = await readDisplayPlaylist();
  return NextResponse.json(playlist, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
