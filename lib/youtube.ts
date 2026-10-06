// One parser for the admin playlist and the in-store display, so a link
// staff can save is always a link the screen can play.

const VIDEO_ID = /^[\w-]{11}$/;
const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
  'www.youtu.be',
]);

export type YouTubeLink =
  | { ok: true; id: string }
  | { ok: false; reason: string };

/** Reads a YouTube video id from watch, share, Shorts, live and embed links. */
export function parseYouTubeLink(raw: string): YouTubeLink {
  const text = raw.trim();
  if (!text) return { ok: false, reason: 'Paste a YouTube video link.' };
  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { ok: false, reason: 'This doesn’t look like a web link.' };
  }
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) {
    return { ok: false, reason: 'Only YouTube videos can play on the store screen.' };
  }
  const parts = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  if (host.endsWith('youtu.be')) id = parts[0] ?? null;
  else if (parts[0] === 'watch') id = url.searchParams.get('v');
  else if (['shorts', 'live', 'embed', 'v'].includes(parts[0] ?? '')) id = parts[1] ?? null;

  if (!id && url.searchParams.get('list')) {
    return {
      ok: false,
      reason: 'Playlist links can’t be added. Add each video’s own link instead.',
    };
  }
  if (!id || !VIDEO_ID.test(id)) {
    return { ok: false, reason: 'This YouTube link doesn’t point to a single video.' };
  }
  return { ok: true, id };
}

export function youTubeId(raw: string) {
  const link = parseYouTubeLink(raw);
  return link.ok ? link.id : null;
}

export function youTubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}
