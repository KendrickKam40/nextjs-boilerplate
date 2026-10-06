import { sql } from './db';
import { youTubeId } from './youtube';

export type DisplayStatus = 'ok' | 'empty' | 'unplayable' | 'unavailable';

export interface DisplayPlaylist {
  ids: string[];
  status: DisplayStatus;
}

// A brief database hiccup should not stop a playlist that was fine a moment ago.
const LAST_GOOD_TTL_MS = 60 * 60 * 1000;
let lastGood: { playlist: DisplayPlaylist; at: number } | null = null;

/** Playlist for the in-store screen. Never throws: the screen must keep running. */
export async function readDisplayPlaylist(): Promise<DisplayPlaylist> {
  let urls: string[];
  try {
    const rows = (await sql`SELECT url FROM playlist_items ORDER BY position ASC`) as {
      url: string;
    }[];
    urls = rows.map((row) => row.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const reason = /not configured/i.test(message)
      ? 'database-not-configured'
      : /playlist_items/i.test(message) && /exist/i.test(message)
        ? 'playlist-table-missing (apply migrations/0003)'
        : 'database-error';
    if (lastGood && Date.now() - lastGood.at < LAST_GOOD_TTL_MS) {
      console.warn(`[store-display] ${reason}; serving the last playlist that loaded`);
      return lastGood.playlist;
    }
    console.warn(`[store-display] playlist unavailable: ${reason}`);
    return { ids: [], status: 'unavailable' };
  }
  if (!urls.length) return { ids: [], status: 'empty' };
  const ids = urls.map(youTubeId).filter((id): id is string => Boolean(id));
  if (ids.length < urls.length) {
    console.warn(`[store-display] skipped ${urls.length - ids.length} link(s) that are not YouTube videos`);
  }
  if (!ids.length) return { ids: [], status: 'unplayable' };
  const playlist: DisplayPlaylist = { ids, status: 'ok' };
  lastGood = { playlist, at: Date.now() };
  return playlist;
}
