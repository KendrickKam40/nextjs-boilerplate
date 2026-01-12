'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VideoItem = { id: string; url: string };
type LayoutSectionId = 'ticker' | 'story' | 'seasonal' | 'categories' | 'contact';
type LayoutItem = { id: LayoutSectionId; enabled: boolean };
type LayoutHistoryItem = {
  id: string;
  layout: { items: LayoutItem[] };
  created_at: string;
  created_by?: string | null;
};
type ThemeKey =
  | 'primaryColor'
  | 'secondaryColor'
  | 'headingPrimaryColor'
  | 'headingSecondaryColor'
  | 'textColor'
  | 'coverTextColor'
  | 'backgroundColor';
type ThemeValues = Record<ThemeKey, string>;
type ThemeOverrides = Partial<ThemeValues>;

const newItem = () => ({ id: crypto.randomUUID(), url: '' });

const THEME_KEYS: ThemeKey[] = [
  'primaryColor',
  'secondaryColor',
  'headingPrimaryColor',
  'headingSecondaryColor',
  'textColor',
  'coverTextColor',
  'backgroundColor',
];

const THEME_DEFAULTS: ThemeValues = {
  primaryColor: '#d6112c',
  secondaryColor: '#9a731e',
  headingPrimaryColor: '#d6112c',
  headingSecondaryColor: '#9a731e',
  textColor: '#171717',
  coverTextColor: '#ffffff',
  backgroundColor: '#FAF3EA',
};

const THEME_FIELDS: { key: ThemeKey; label: string; description: string }[] = [
  {
    key: 'primaryColor',
    label: 'Primary color',
    description: 'Primary button and accent color.',
  },
  {
    key: 'secondaryColor',
    label: 'Secondary color',
    description: 'Secondary button and highlight color.',
  },
  {
    key: 'headingPrimaryColor',
    label: 'Heading primary color',
    description: 'Primary header color (H1/H2).',
  },
  {
    key: 'headingSecondaryColor',
    label: 'Heading secondary color',
    description: 'Secondary header color (H3+).',
  },
  {
    key: 'textColor',
    label: 'Text color',
    description: 'Default text color across the site.',
  },
  {
    key: 'coverTextColor',
    label: 'Hero text color',
    description: 'Text color on the hero image.',
  },
  {
    key: 'backgroundColor',
    label: 'Background color',
    description: 'Main page background color.',
  },
];

const LAYOUT_SECTIONS: { id: LayoutSectionId; label: string; description: string }[] = [
  { id: 'ticker', label: 'Ticker', description: 'Scrolling announcement banner.' },
  { id: 'story', label: 'Our Story', description: 'Brand story with image.' },
  { id: 'seasonal', label: 'Seasonal Offers', description: 'Showcase specials section.' },
  { id: 'categories', label: 'Categories', description: 'Category carousel.' },
  { id: 'contact', label: 'Contact', description: 'Contact details and map.' },
];

const DEFAULT_LAYOUT_ITEMS: LayoutItem[] = LAYOUT_SECTIONS.map((section) => ({
  id: section.id,
  enabled: true,
}));

export default function AdminDashboard() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([newItem()]);
  const [activeTab, setActiveTab] = useState<'playlist' | 'theme' | 'layout'>('playlist');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeLoading, setThemeLoading] = useState(true);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeStatus, setThemeStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [posTheme, setPosTheme] = useState<ThemeValues | null>(null);
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides>({});
  const [themeDraft, setThemeDraft] = useState<ThemeValues>(THEME_DEFAULTS);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [layoutStatus, setLayoutStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(DEFAULT_LAYOUT_ITEMS);
  const [layoutHistory, setLayoutHistory] = useState<LayoutHistoryItem[]>([]);
  const [layoutDropIndex, setLayoutDropIndex] = useState<number | null>(null);
  const layoutPreviewRef = useRef<HTMLDivElement>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const layoutPreviewQuery = useMemo(
    () => encodeURIComponent(JSON.stringify({ items: layoutItems })),
    [layoutItems]
  );

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

  const loadTheme = async () => {
    setThemeLoading(true);
    try {
      const res = await fetch('/api/admin/theme', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to load theme');
      }
      const data = await res.json();
      const nextPos = extractThemeValues(data?.posTheme || {});
      const nextOverrides = extractThemeOverrides(data?.overrides || {});
      const merged = { ...nextPos, ...nextOverrides };
      setPosTheme(nextPos);
      setThemeOverrides(nextOverrides);
      setThemeDraft(applyThemeDefaults(merged));
      setThemeStatus({ type: 'idle' });
    } catch (err: any) {
      setThemeStatus({ type: 'error', message: err?.message || 'Unable to load theme' });
    } finally {
      setThemeLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const normalizeLayoutItems = (input: any): LayoutItem[] => {
    const rawItems = Array.isArray(input?.items) ? input.items : Array.isArray(input) ? input : [];
    const allowed = new Set<LayoutSectionId>(LAYOUT_SECTIONS.map((section) => section.id));
    const seen = new Set<LayoutSectionId>();
    const items: LayoutItem[] = [];
    for (const raw of rawItems) {
      const id = raw?.id as LayoutSectionId;
      if (!id || !allowed.has(id)) continue;
      if (seen.has(id)) continue;
      items.push({ id, enabled: raw?.enabled !== false });
      seen.add(id);
    }
    return items;
  };

  const loadLayout = async () => {
    setLayoutLoading(true);
    try {
      const res = await fetch('/api/admin/layout?page=home', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to load layout');
      }
      const data = await res.json();
      const currentItems = normalizeLayoutItems(data?.current?.layout);
      setLayoutItems(data?.current ? currentItems : DEFAULT_LAYOUT_ITEMS);
      setLayoutHistory(Array.isArray(data?.history) ? data.history : []);
      setLayoutStatus({ type: 'idle' });
    } catch (err: any) {
      setLayoutStatus({ type: 'error', message: err?.message || 'Unable to load layout' });
    } finally {
      setLayoutLoading(false);
    }
  };

  useEffect(() => {
    loadLayout();
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

  const saveTheme = async () => {
    if (!posTheme) return;
    setThemeSaving(true);
    setThemeStatus({ type: 'idle' });
    try {
      const overridesToSave: ThemeOverrides = {};
      for (const key of THEME_KEYS) {
        const normalized = normalizeHexColor(themeDraft[key]);
        if (normalized && normalized !== posTheme[key]) {
          overridesToSave[key] = normalized;
        }
      }

      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: overridesToSave }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      setThemeStatus({ type: 'success', message: 'Theme overrides saved.' });
      await loadTheme();
    } catch (err: any) {
      setThemeStatus({ type: 'error', message: err?.message || 'Save failed' });
    } finally {
      setThemeSaving(false);
    }
  };

  const saveLayout = async () => {
    setLayoutSaving(true);
    setLayoutStatus({ type: 'idle' });
    try {
      const res = await fetch('/api/admin/layout?page=home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: { items: layoutItems } }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      setLayoutStatus({ type: 'success', message: 'Layout saved.' });
      await loadLayout();
      setPreviewNonce((value) => value + 1);
    } catch (err: any) {
      setLayoutStatus({ type: 'error', message: err?.message || 'Save failed' });
    } finally {
      setLayoutSaving(false);
    }
  };

  const restoreLayout = async (versionId: string) => {
    setLayoutSaving(true);
    setLayoutStatus({ type: 'idle' });
    try {
      const res = await fetch('/api/admin/layout?page=home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', versionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Restore failed');
      }
      setLayoutStatus({ type: 'success', message: 'Layout restored.' });
      await loadLayout();
      setPreviewNonce((value) => value + 1);
    } catch (err: any) {
      setLayoutStatus({ type: 'error', message: err?.message || 'Restore failed' });
    } finally {
      setLayoutSaving(false);
    }
  };

  const onLayoutDragStart = (
    e: React.DragEvent,
    payload: { source: 'available' | 'preview'; id: LayoutSectionId; index?: number }
  ) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };

  const getLayoutDropIndex = (clientY: number) => {
    const container = layoutPreviewRef.current;
    if (!container) return layoutItems.length;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-layout-item]'));
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) return i;
    }
    return items.length;
  };

  const onLayoutDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setLayoutDropIndex(getLayoutDropIndex(e.clientY));
  };

  const onLayoutDragLeave = (e: React.DragEvent) => {
    if (!layoutPreviewRef.current) return;
    if (layoutPreviewRef.current.contains(e.relatedTarget as Node)) return;
    setLayoutDropIndex(null);
  };

  const onLayoutDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const targetIndex = layoutDropIndex ?? layoutItems.length;
    setLayoutDropIndex(null);
    if (!raw) return;
    let data: { source: 'available' | 'preview'; id: LayoutSectionId; index?: number };
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    if (!data?.id) return;

    setLayoutItems((prev) => {
      const exists = prev.findIndex((item) => item.id === data.id);
      const next = [...prev];

      if (data.source === 'available') {
        if (exists >= 0) return prev;
        next.splice(targetIndex, 0, { id: data.id, enabled: true });
        return next;
      }

      if (data.source === 'preview' && typeof data.index === 'number') {
        if (data.index === targetIndex) return prev;
        const [moved] = next.splice(data.index, 1);
        const insertIndex = data.index < targetIndex ? targetIndex - 1 : targetIndex;
        next.splice(insertIndex, 0, moved);
        return next;
      }

      return prev;
    });
  };
  
  const onLayoutDragEnd = () => setLayoutDropIndex(null);

  const resetTheme = async () => {
    setThemeSaving(true);
    setThemeStatus({ type: 'idle' });
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Reset failed');
      }
      setThemeStatus({ type: 'success', message: 'Synced with POS.' });
      await loadTheme();
    } catch (err: any) {
      setThemeStatus({ type: 'error', message: err?.message || 'Reset failed' });
    } finally {
      setThemeSaving(false);
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
            <h1 className="text-2xl font-bold">Display Settings</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="md:w-60">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Settings
              </p>
              <nav className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('playlist')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                    activeTab === 'playlist'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Playlist
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('theme')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                    activeTab === 'theme'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Theme
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('layout')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                    activeTab === 'layout'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Layout
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {activeTab === 'playlist' && (
              <>
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Playlist</h2>
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
                        <h3 className="text-lg font-semibold">Preview</h3>
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
              </>
            )}

            {activeTab === 'theme' && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Theme</h2>
                    <p className="text-sm text-gray-600">
                      Overrides apply to the public site only. Reset to POS clears overrides.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetTheme}
                    disabled={themeLoading || themeSaving}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Reset to POS
                  </button>
                </div>

                {themeLoading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {THEME_FIELDS.map((field) => {
                        const value = themeDraft[field.key];
                        const posValue = posTheme?.[field.key] || '';
                        const isOverridden = Boolean(themeOverrides[field.key]);
                        return (
                          <div
                            key={field.key}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <label className="text-sm font-semibold text-gray-900">
                                  {field.label}
                                </label>
                                <p className="text-xs text-gray-500">{field.description}</p>
                              </div>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  isOverridden
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isOverridden ? 'Override' : 'Synced'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={value}
                                onChange={(e) =>
                                  setThemeDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                                }
                                className="h-10 w-12 rounded border border-gray-300 bg-white p-1"
                                aria-label={`${field.label} picker`}
                              />
                              <div className="text-sm font-mono text-gray-700">{value}</div>
                            </div>
                            <p className="text-xs text-gray-500">POS: {posValue || 'N/A'}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={saveTheme}
                        disabled={themeSaving}
                        className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
                      >
                        <span aria-hidden>💾</span>
                        {themeSaving ? 'Saving...' : 'Save theme'}
                      </button>
                      {themeStatus.type === 'success' && (
                        <span className="text-sm text-green-700">{themeStatus.message}</span>
                      )}
                      {themeStatus.type === 'error' && (
                        <span className="text-sm text-red-600">{themeStatus.message}</span>
                      )}
                    </div>

                    <div
                      className="rounded-2xl border border-gray-200 p-4 space-y-3"
                      style={{
                        backgroundColor: themeDraft.backgroundColor,
                        color: themeDraft.textColor,
                      }}
                    >
                      <div className="text-xs uppercase tracking-wide text-gray-500">Preview</div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold" style={{ color: themeDraft.headingPrimaryColor }}>
                          Theme preview
                        </h3>
                        <h4 className="text-base font-semibold" style={{ color: themeDraft.headingSecondaryColor }}>
                          Secondary heading
                        </h4>
                        <p className="text-sm" style={{ color: themeDraft.textColor }}>
                          Buttons and text update with your overrides.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg font-semibold text-white"
                            style={{ backgroundColor: themeDraft.primaryColor }}
                          >
                            Primary
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg font-semibold border"
                            style={{
                              borderColor: themeDraft.secondaryColor,
                              color: themeDraft.secondaryColor,
                            }}
                          >
                            Secondary
                          </button>
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: themeDraft.coverTextColor }}
                        >
                          Hero text sample
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'layout' && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Layout</h2>
                  <p className="text-sm text-gray-600">
                    Drag sections into the preview to build your homepage layout. Disable to hide a section.
                  </p>
                </div>

                {layoutLoading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Available sections
                      </h3>
                      <div className="space-y-3">
                        {LAYOUT_SECTIONS.map((section) => {
                          const isInLayout = layoutItems.some((item) => item.id === section.id);
                          return (
                            <div
                              key={section.id}
                              className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2"
                              draggable={!isInLayout}
                              onDragStart={(e) =>
                                onLayoutDragStart(e, { source: 'available', id: section.id })
                              }
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{section.label}</p>
                                  <p className="text-xs text-gray-500">{section.description}</p>
                                </div>
                                <button
                                  type="button"
                                  disabled={isInLayout}
                                  onClick={() => {
                                    if (isInLayout) return;
                                    setLayoutItems((prev) => [...prev, { id: section.id, enabled: true }]);
                                  }}
                                  className="text-xs font-semibold px-2 py-1 rounded-full border border-gray-300 text-gray-700 disabled:opacity-50"
                                >
                                  {isInLayout ? 'Added' : 'Add'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Preview
                      </h3>
                      <div
                        className="min-h-[240px] rounded-xl border border-dashed border-gray-300 bg-white p-4 space-y-3"
                        ref={layoutPreviewRef}
                        onDragOver={onLayoutDragOver}
                        onDragLeave={onLayoutDragLeave}
                        onDrop={onLayoutDrop}
                      >
                        {layoutItems.length === 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">Drag sections here to build a layout.</p>
                            {layoutDropIndex === 0 && (
                              <div className="h-0.5 rounded-full bg-gray-900/70" />
                            )}
                          </div>
                        )}
                        {layoutItems.map((item, idx) => {
                          const meta = LAYOUT_SECTIONS.find((section) => section.id === item.id);
                          return (
                            <div key={`${item.id}-${idx}`} className="space-y-2">
                              {layoutDropIndex === idx && (
                                <div className="h-0.5 rounded-full bg-gray-900/70" />
                              )}
                              <div
                                data-layout-item
                                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                draggable
                                onDragStart={(e) =>
                                  onLayoutDragStart(e, { source: 'preview', id: item.id, index: idx })
                                }
                                onDragEnd={onLayoutDragEnd}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-gray-400 cursor-grab select-none">☰</span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {meta?.label || item.id}
                                    </p>
                                    <p className="text-xs text-gray-500">{meta?.description || ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLayoutItems((prev) =>
                                        prev.map((entry, entryIdx) =>
                                          entryIdx === idx ? { ...entry, enabled: !entry.enabled } : entry
                                        )
                                      );
                                    }}
                                    className="h-8 w-8 rounded-full border border-gray-300 grid place-items-center text-gray-700 hover:bg-white"
                                    aria-label={item.enabled ? 'Hide section' : 'Show section'}
                                    title={item.enabled ? 'Hide section' : 'Show section'}
                                  >
                                    {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLayoutItems((prev) => prev.filter((_, entryIdx) => entryIdx !== idx))
                                    }
                                    className="h-8 w-8 rounded-full border border-gray-300 grid place-items-center text-red-600 hover:bg-white"
                                    aria-label="Remove section"
                                    title="Remove section"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {layoutDropIndex === layoutItems.length && layoutItems.length > 0 && (
                          <div className="h-0.5 rounded-full bg-gray-900/70" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={saveLayout}
                    disabled={layoutSaving}
                    className="rounded-lg bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
                  >
                    <span aria-hidden>💾</span>
                    {layoutSaving ? 'Saving...' : 'Save layout'}
                  </button>
                  {layoutStatus.type === 'success' && (
                    <span className="text-sm text-green-700">{layoutStatus.message}</span>
                  )}
                  {layoutStatus.type === 'error' && (
                    <span className="text-sm text-red-600">{layoutStatus.message}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    History
                  </h3>
                  <div className="space-y-2">
                    {layoutHistory.length === 0 && (
                      <p className="text-sm text-gray-500">No layout history yet.</p>
                    )}
                    {layoutHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.created_by || 'admin'} • {entry.layout?.items?.length || 0} sections
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => restoreLayout(entry.id)}
                          disabled={layoutSaving}
                          className="text-sm font-semibold text-gray-900 hover:underline disabled:opacity-60"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Live preview
                      </h3>
                      <p className="text-xs text-gray-500">
                        This is the homepage as it will appear on the website.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => setPreviewNonce((value) => value + 1)}
                        className="rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-50"
                      >
                        Refresh preview
                      </button>
                      <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Open live site
                      </a>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-[70vh] w-full bg-white">
                      <iframe
                        key={previewNonce}
                        title="Homepage preview"
                        src={`/?layoutPreview=${layoutPreviewQuery}${previewNonce ? `&preview=${previewNonce}` : ''}`}
                        className="h-full w-full"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function normalizeHexColor(value?: string) {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (raw.startsWith('0x') && raw.length >= 8) return `#${raw.slice(-6)}`;
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`;
  return '';
}

function extractThemeValues(input: Record<string, any>): ThemeValues {
  const next = { ...THEME_DEFAULTS };
  for (const key of THEME_KEYS) {
    const normalized = normalizeHexColor(input?.[key]);
    if (normalized) next[key] = normalized;
  }
  return next;
}

function extractThemeOverrides(input: Record<string, any>): ThemeOverrides {
  const overrides: ThemeOverrides = {};
  for (const key of THEME_KEYS) {
    const normalized = normalizeHexColor(input?.[key]);
    if (normalized) overrides[key] = normalized;
  }
  return overrides;
}

function applyThemeDefaults(input: ThemeValues): ThemeValues {
  return { ...THEME_DEFAULTS, ...input };
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
