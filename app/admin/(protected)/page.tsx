'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type VideoItem = { id: string; url: string };

const newItem = () => ({ id: crypto.randomUUID(), url: '' });

export default function AdminDashboard() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([newItem()]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/video', { cache: 'no-store' });
        const data = await res.json();
        const items: string[] = data.videoUrls || [];
        if (items.length === 0) setVideos([newItem()]);
        else setVideos(items.map((u) => ({ id: crypto.randomUUID(), url: u })));
      } catch {
        setStatus({ type: 'error', message: 'Unable to load current video URL.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: 'idle' });
    try {
      const cleaned = videos.map((v) => v.url.trim()).filter(Boolean);
      if (cleaned.length === 0) {
        setStatus({ type: 'error', message: 'Please add at least one video URL.' });
        setSaving(false);
        return;
      }
      const res = await fetch('/api/admin/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrls: cleaned }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus({ type: 'error', message: data.error || 'Save failed' });
        return;
      }
      setStatus({ type: 'success', message: 'Playlist updated.' });
    } catch {
      setStatus({ type: 'error', message: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const move = (index: number, delta: number) => {
    setVideos((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onDrop = (e: React.DragEvent, idx: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;
    setVideos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(idx, 0, item);
      return next;
    });
  };

  const previewUrl = useMemo(() => {
    const cleaned = videos.map((v) => v.url.trim()).filter(Boolean);
    return toEmbedUrl(cleaned[0] || '');
  }, [videos]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Admin</p>
            <h1 className="text-2xl font-bold text-gray-900">Display Settings</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Playlist</h2>
                <p className="text-sm text-gray-600">
                  Add multiple YouTube URLs and drag cards to reorder. The display will loop through them in order.
                </p>
              </div>

          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-3">
                {videos.map((v, idx) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg sm:flex-row sm:items-start sm:gap-3"
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, idx)}
                  >
                    <div className="w-full flex items-center justify-between gap-3 sm:w-10 sm:flex-col sm:items-center sm:justify-start sm:gap-2 text-gray-500">
                      <span className="text-lg cursor-grab select-none sm:mt-1">☰</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Video #{idx + 1}
                          </label>
                          {videoIdFromUrl(v.url) && (
                            <span className="text-xs text-gray-500">
                              ID: {videoIdFromUrl(v.url)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideos((prev) => prev.filter((it) => it.id !== v.id));
                          }}
                          disabled={videos.length === 1}
                          className="h-9 w-9 grid place-items-center rounded-lg border border-gray-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          aria-label="Remove video"
                          title="Remove video"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {videoIdFromUrl(v.url) && (
                          <div className="shrink-0 flex items-center gap-2 text-xs text-gray-600">
                            <img
                              src={thumbnailFromUrl(v.url)}
                              alt="Thumbnail"
                              className="h-16 w-24 object-cover rounded border border-gray-200"
                            />
                          </div>
                        )}
                        <input
                          type="url"
                          value={v.url}
                          onChange={(e) =>
                            setVideos((prev) =>
                              prev.map((it) => (it.id === v.id ? { ...it, url: e.target.value } : it))
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                          placeholder="https://www.youtube.com/watch?v=..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setVideos((prev) => [...prev, newItem()])}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                    aria-label="Add another video"
                  >
                    <span aria-hidden>＋</span>
                    <span>Add video</span>
                  </button>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
                    >
                      <span aria-hidden>💾</span>
                      {saving ? 'Saving…' : 'Save playlist'}
                    </button>
                    {status.type === 'success' && (
                      <span className="text-sm text-green-700">{status.message}</span>
                    )}
                    {status.type === 'error' && (
                      <span className="text-sm text-red-600">{status.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </section>

        {videos.some((v) => v.url.trim()) && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <p className="text-sm text-gray-600">Looping view as shown on the display.</p>
              </div>
              <a
                href={videos[0]?.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gray-900 hover:underline"
              >
                Open video
              </a>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black">
              <iframe
                key={previewUrl}
                className="w-full h-full"
                src={previewUrl}
                title="Video preview"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function toEmbedUrl(url: string) {
  if (!url) return '';
  try {
    const videoId = videoIdFromUrl(url);
    if (!videoId) return url;
    const embed = new URL(`https://www.youtube.com/embed/${videoId}`);
    embed.searchParams.set('autoplay', '1');
    embed.searchParams.set('mute', '1');
    embed.searchParams.set('controls', '0');
    embed.searchParams.set('loop', '1');
    embed.searchParams.set('playlist', videoId);
    embed.searchParams.set('rel', '0');
    return embed.toString();
  } catch {
    return url;
  }
}

function videoIdFromUrl(url: string) {
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
}

function thumbnailFromUrl(url: string) {
  const id = videoIdFromUrl(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
