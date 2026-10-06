'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye, EyeOff, GripVertical, History, RefreshCw } from 'lucide-react';
import {
  ANNOUNCEMENT_SECTION,
  LAYOUT_SECTIONS,
  type LayoutConfig,
  type LayoutItem,
  type LayoutSectionId,
} from '@/lib/layout-config';
import { adminRequest } from './adminRequest';
import { AdminDialog, Button, MoveButtons, Panel, StatusMessage, moveItem, type Status } from './ui';

type Chapter = { id: LayoutSectionId; enabled: boolean };
type Draft = { chapters: Chapter[]; announcement: boolean };
type HistoryEntry = { id: string; layout: LayoutConfig; created_at: string };

const SECTIONS = LAYOUT_SECTIONS.home;
const CHAPTER_IDS = SECTIONS.map((section) => section.id).filter((id) => id !== ANNOUNCEMENT_SECTION);
const meta = (id: LayoutSectionId) => SECTIONS.find((section) => section.id === id)!;
const announcementMeta = meta(ANNOUNCEMENT_SECTION);

/** Every chapter appears once; anything missing from an older save comes back hidden. */
function toDraft(layout?: LayoutConfig | null): Draft {
  const items = layout?.items ?? [];
  const chapters: Chapter[] = items
    .filter((item) => item.id !== ANNOUNCEMENT_SECTION)
    .map((item) => ({ id: item.id, enabled: item.enabled }));
  for (const id of CHAPTER_IDS) {
    if (!chapters.some((chapter) => chapter.id === id)) chapters.push({ id, enabled: !layout });
  }
  const announcement = layout
    ? items.some((item) => item.id === ANNOUNCEMENT_SECTION && item.enabled)
    : true;
  return { chapters, announcement };
}

function toLayout(draft: Draft): LayoutConfig {
  const items: LayoutItem[] = [
    { id: ANNOUNCEMENT_SECTION, enabled: draft.announcement },
    ...draft.chapters,
  ];
  return { items };
}

const key = (draft: Draft) => JSON.stringify(toLayout(draft));
const when = (iso: string) =>
  new Intl.DateTimeFormat('en-NZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

function Summary({ layout }: { layout: LayoutConfig }) {
  const draft = toDraft(layout);
  return (
    <ol className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--a-muted)]">
      {draft.chapters.map((chapter, index) => (
        <li key={chapter.id} className={chapter.enabled ? '' : 'line-through'}>
          {index + 1}. {meta(chapter.id).label}
          {!chapter.enabled && <span className="sr-only"> (hidden)</span>}
        </li>
      ))}
      <li>Announcement {draft.announcement ? 'on' : 'off'}</li>
    </ol>
  );
}

export default function LayoutTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [draft, setDraft] = useState<Draft>(toDraft(null));
  const [savedKey, setSavedKey] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<HistoryEntry | null>(null);
  const [previewKey, setPreviewKey] = useState('');
  const [previewNonce, setPreviewNonce] = useState(0);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  /** `refresh` updates saved state and history in place, without a spinner or touching edits. */
  const load = async (options: { refresh?: boolean; replaceDraft?: boolean } = {}) => {
    const refresh = options.refresh ?? false;
    const replaceDraft = options.replaceDraft ?? !refresh;
    if (!refresh) setLoading(true);
    setLoadError('');
    const result = await adminRequest<{
      current: { versionId: string | null; layout: LayoutConfig } | null;
      history: HistoryEntry[];
    }>('/api/admin/layout?page=home');
    if (result.ok) {
      const next = toDraft(result.data.current?.versionId ? result.data.current.layout : null);
      setSavedKey(key(next));
      if (replaceDraft) {
        setDraft(next);
        setPreviewKey(key(next));
      }
      setCurrentId(result.data.current?.versionId ?? null);
      setHistory(Array.isArray(result.data.history) ? result.data.history : []);
    } else if (!refresh) {
      setLoadError(result.message);
    }
    if (!refresh) setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const draftKey = key(draft);
  const dirty = !loading && !loadError && draftKey !== savedKey;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  const visibleCount = draft.chapters.filter((chapter) => chapter.enabled).length;
  const previewSrc = useMemo(
    () => `/?layoutPreview=${encodeURIComponent(previewKey || draftKey)}&preview=${previewNonce}`,
    [previewKey, draftKey, previewNonce],
  );

  const change = (next: (prev: Draft) => Draft) => {
    setStatus({ type: 'idle' });
    setDraft(next);
  };
  const moveChapter = (index: number, delta: number) =>
    change((prev) => ({ ...prev, chapters: moveItem(prev.chapters, index, delta) }));

  const save = async () => {
    if (visibleCount === 0) {
      setStatus({ type: 'error', message: 'Show at least one homepage section. Otherwise the homepage is just the headline.' });
      return;
    }
    setSaving(true);
    setStatus({ type: 'idle' });
    const sentKey = draftKey;
    const result = await adminRequest('/api/admin/layout?page=home', {
      method: 'POST',
      body: JSON.stringify({ layout: toLayout(draft) }),
    });
    setSaving(false);
    if (!result.ok) {
      setStatus({ type: 'error', message: result.message });
      return;
    }
    // Edits made while saving stay as unsaved changes.
    setSavedKey(sentKey);
    void load({ refresh: true });
    setStatus({ type: 'success', message: 'Saved. The homepage shows this layout now.' });
  };

  const restore = async (entry: HistoryEntry) => {
    setSaving(true);
    const result = await adminRequest('/api/admin/layout?page=home', {
      method: 'POST',
      body: JSON.stringify({ action: 'restore', versionId: entry.id }),
    });
    setSaving(false);
    if (!result.ok) {
      setStatus({ type: 'error', message: result.message });
      setRestoreTarget(null);
      return;
    }
    setRestoreTarget(null);
    setHistoryOpen(false);
    await load({ refresh: true, replaceDraft: true });
    setStatus({ type: 'success', message: `Restored the layout from ${when(entry.created_at)}.` });
  };

  return (
    <div className="space-y-6">
      <Panel
        title="Homepage layout"
        description="Choose which sections appear on the homepage, and in what order. Hidden sections are not shown to visitors."
        actions={
          <Button onClick={() => setHistoryOpen(true)} disabled={loading || history.length === 0}>
            <History className="h-4 w-4" aria-hidden="true" />
            Earlier versions
          </Button>
        }
      >
        {loading ? (
          <p className="text-sm text-[var(--a-muted)]" role="status">
            Loading layout…
          </p>
        ) : loadError ? (
          <div className="space-y-3" role="alert">
            <p className="text-sm font-semibold text-[var(--a-danger)]">{loadError}</p>
            <Button onClick={() => void load()}>Try again</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <ol className="space-y-3" aria-label="Homepage sections, in order">
              {draft.chapters.map((chapter, index) => {
                const section = meta(chapter.id);
                return (
                  <li
                    key={chapter.id}
                    className={`flex flex-col gap-3 rounded-xl border border-[var(--a-line)] p-3 sm:flex-row sm:items-center sm:p-4 ${
                      chapter.enabled ? 'bg-[var(--a-sunken)]' : 'bg-[var(--a-surface)] border-dashed'
                    } ${dragFrom === index ? 'opacity-60' : ''}`}
                    onDragOver={(event) => dragFrom !== null && event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragFrom !== null) moveChapter(dragFrom, index - dragFrom);
                      setDragFrom(null);
                    }}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', String(index));
                          setDragFrom(index);
                        }}
                        onDragEnd={() => setDragFrom(null)}
                        className="hidden h-11 w-6 cursor-grab place-items-center text-[var(--a-muted)] [@media(pointer:fine)]:grid"
                        aria-hidden="true"
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {index + 1}. {section.label}
                          {!chapter.enabled && (
                            <span className="ml-2 rounded-full border border-[var(--a-line)] px-2 py-0.5 text-xs font-semibold text-[var(--a-muted)]">
                              Hidden
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[var(--a-muted)]">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <Button
                        onClick={() =>
                          change((prev) => ({
                            ...prev,
                            chapters: prev.chapters.map((item, i) =>
                              i === index ? { ...item, enabled: !item.enabled } : item,
                            ),
                          }))
                        }
                        className="min-w-24"
                      >
                        {chapter.enabled ? (
                          <>
                            <EyeOff className="h-4 w-4" aria-hidden="true" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" aria-hidden="true" /> Show
                          </>
                        )}
                        <span className="sr-only"> {section.label}</span>
                      </Button>
                      <MoveButtons
                        name={section.label}
                        index={index}
                        count={draft.chapters.length}
                        onMove={(delta) => moveChapter(index, delta)}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>

            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-[var(--a-line)] p-3 sm:p-4">
              <input
                type="checkbox"
                checked={draft.announcement}
                onChange={(event) => change((prev) => ({ ...prev, announcement: event.target.checked }))}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--a-primary)]"
              />
              <span>
                <span className="block font-semibold">Show the {announcementMeta.label.toLowerCase()}</span>
                <span className="block text-sm text-[var(--a-muted)]">
                  {announcementMeta.description} Change the message itself in the POS.
                </span>
              </span>
            </label>

            {visibleCount === 0 && (
              <p role="alert" className="text-sm font-semibold text-[var(--a-danger)]">
                Every section is hidden. Show at least one before saving.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button variant="primary" onClick={() => void save()} inactive={saving || !dirty || visibleCount === 0}>
                {saving ? 'Saving…' : 'Save layout'}
              </Button>
              {dirty && status.type === 'idle' && (
                <p className="text-sm text-[var(--a-warning)]">Unsaved changes</p>
              )}
              <StatusMessage status={status} />
            </div>
          </div>
        )}
      </Panel>

      {!loading && !loadError && (
        <Panel
          title="Homepage preview"
          description={
            previewKey === draftKey
              ? 'This is the homepage with the layout above.'
              : 'The preview shows an earlier version of your changes. Update it to see the latest.'
          }
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  setPreviewKey(draftKey);
                  setPreviewNonce((value) => value + 1);
                }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Update preview
              </Button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
              >
                Open the website <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          }
        >
          <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-xl border border-[var(--a-line)] bg-[var(--a-surface)]">
            <iframe key={previewSrc} title="Homepage preview" src={previewSrc} className="h-full w-full" loading="lazy" />
          </div>
        </Panel>
      )}

      {/* One dialog, two steps, so focus returns to “Earlier versions” however it closes. */}
      <AdminDialog
        open={historyOpen}
        title={restoreTarget ? 'Restore this layout?' : 'Earlier versions'}
        onClose={() => {
          setRestoreTarget(null);
          setHistoryOpen(false);
        }}
      >
        {restoreTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--a-muted)]">
              The homepage will change to this version straight away.
              {dirty && ' Your unsaved changes on this page will be replaced.'}
            </p>
            <div className="rounded-lg border border-[var(--a-line)] bg-[var(--a-sunken)] p-3">
              <p className="font-semibold">{when(restoreTarget.created_at)}</p>
              <Summary layout={restoreTarget.layout} />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button onClick={() => setRestoreTarget(null)}>Back to versions</Button>
              <Button variant="primary" onClick={() => void restore(restoreTarget)} inactive={saving}>
                {saving ? 'Restoring…' : 'Restore this layout'}
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => {
              const live = entry.id === currentId;
              return (
                <li
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--a-line)] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {when(entry.created_at)}
                      {live && (
                        <span className="ml-2 rounded-full bg-[var(--a-success-soft)] px-2 py-0.5 text-xs text-[var(--a-success)]">
                          On the website now
                        </span>
                      )}
                    </p>
                    <Summary layout={entry.layout} />
                  </div>
                  {!live && (
                    <Button onClick={() => setRestoreTarget(entry)} inactive={saving}>
                      Restore<span className="sr-only"> the version from {when(entry.created_at)}</span>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AdminDialog>
    </div>
  );
}
