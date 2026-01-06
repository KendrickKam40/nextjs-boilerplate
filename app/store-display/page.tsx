export const dynamic = 'force-dynamic';

import { sql } from '@/lib/db';

function toPlaylistEmbed(urls: string[]) {
  const validIds = urls
    .map((url) => {
      try {
        const u = new URL(url);
        const isWatch = u.hostname.includes('youtube.com') && u.pathname === '/watch';
        const isShort = u.hostname === 'youtu.be';
        if (isWatch) return u.searchParams.get('v') || '';
        if (isShort) return u.pathname.slice(1);
        return '';
      } catch {
        return '';
      }
    })
    .filter(Boolean);
  if (validIds.length === 0) return '';
  const first = validIds[0];
  const embed = new URL(`https://www.youtube.com/embed/${first}`);
  embed.searchParams.set('autoplay', '1');
  embed.searchParams.set('mute', '1');
  embed.searchParams.set('controls', '0');
  embed.searchParams.set('loop', '1');
  embed.searchParams.set('playlist', validIds.join(','));
  embed.searchParams.set('rel', '0');
  return embed.toString();
}

export default async function StoreDisplayPage() {
  const rows = await sql<{ url: string }[]>`SELECT url FROM playlist_items ORDER BY position ASC`;
  const videoUrls = rows.map((r) => r.url);
  const embed = toPlaylistEmbed(videoUrls);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {embed ? (
        <div className="w-full h-screen">
          <iframe
            className="w-full h-full"
            src={embed}
            title="Store display"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="text-white text-lg">No video configured yet.</p>
      )}
    </div>
  );
}
