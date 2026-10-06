'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, GripVertical, Play, Plus, Trash2 } from 'lucide-react';
import { parseYouTubeLink, youTubeThumbnail } from '@/lib/youtube';
import { adminRequest } from './adminRequest';
import { Button, FIELD_CLASS, IconButton, MoveButtons, Panel, StatusMessage, moveItem, type Status } from './ui';

type Row = { key: string; url: string; touched: boolean; serverError?: string };

const MAX_VIDEOS = 50;
const newRow = (url = ''): Row => ({ key: crypto.randomUUID(), url, touched: false });

function rowError(row: Row) {
  if (row.serverError) return row.serverError;
  if (!row.url.trim()) return row.touched ? 'Paste a YouTube video link, or remove this row.' : undefined;
  const link = parseYouTubeLink(row.url);
  return link.ok || !row.touched ? undefined : link.reason;
}

export default function PlaylistTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    const result = await adminRequest<{ videoUrls: string[] }>('/api/admin/video');
    if (result.ok) {
      const urls = result.data.videoUrls ?? [];
      setSaved(urls);
      setRows(urls.length ? urls.map((url) => newRow(url)) : [newRow()]);
    } else {
      setLoadError(result.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const current = rows.map((row) => row.url.trim()).filter(Boolean);
  const dirty = !loading && !loadError && current.join('\n') !== saved.join('\n');
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const firstPlayable = useMemo(() => {
    for (const row of rows) {
      const link = parseYouTubeLink(row.url);
      if (link.ok) return { id: link.id, url: row.url.trim() };
    }
    return null;
  }, [rows]);

  const update = (index: number, patch: Partial<Row>) => {
    setStatus({ type: 'idle' });
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const filled = rows.filter((row) => row.url.trim());
    const checked = (filled.length ? filled : [rows[0]]).map((row) => ({
      ...row,
      touched: true,
      serverError: undefined,
    }));
    setRows(checked);
    const problems = checked.filter((row) => rowError(row));
    if (!current.length) {
      setStatus({ type: 'error', message: 'Add at least one YouTube video before saving.' });
      return;
    }
    if (problems.length) {
      setStatus({
        type: 'error',
        message: problems.length === 1 ? 'One video link needs fixing.' : `${problems.length} video links need fixing.`,
      });
      return;
    }
    setSaving(true);
    setStatus({ type: 'idle' });
    const result = await adminRequest<{ videoUrls: string[] }>('/api/admin/video', {
      method: 'POST',
      body: JSON.stringify({ videoUrls: current }),
    });
    setSaving(false);
    if (result.ok) {
      setSaved(result.data.videoUrls);
      setStatus({ type: 'success', message: 'Saved. The store screen will update within a minute.' });
      return;
    }
    const serverProblems: { index: number; message: string }[] = result.data.problems ?? [];
    if (serverProblems.length) {
      setRows(
        checked.map((row, index) => ({
          ...row,
          serverError: serverProblems.find((problem) => problem.index === index)?.message,
        })),
      );
    }
    setStatus({ type: 'error', message: result.message });
  };

  return (
    <div className="space-y-6">
      <Panel
        title="In-store videos"
        description="These play on the counter screen in this order, muted and on repeat. Saved changes appear on the screen within a minute."
      >
        {loading ? (
          <p className="text-sm text-[var(--a-muted)]" role="status">
            Loading videos…
          </p>
        ) : loadError ? (
          <div className="space-y-3" role="alert">
            <p className="text-sm font-semibold text-[var(--a-danger)]">{loadError}</p>
            <Button onClick={() => void load()}>Try again</Button>
          </div>
        ) : (
          <form onSubmit={save} noValidate className="space-y-4">
            <ol className="space-y-3">
              {rows.map((row, index) => {
                const inputId = `video-${row.key}`;
                const errorId = `${inputId}-error`;
                const error = rowError(row);
                const link = parseYouTubeLink(row.url);
                return (
                  <li
                    key={row.key}
                    className={`rounded-xl border bg-[var(--a-sunken)] p-3 sm:p-4 ${
                      error ? 'border-[var(--a-danger)]' : 'border-[var(--a-line)]'
                    } ${dragFrom === index ? 'opacity-60' : ''}`}
                    onDragOver={(event) => dragFrom !== null && event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragFrom === null) return;
                      setRows((prev) => moveItem(prev, dragFrom, index - dragFrom));
                      setDragFrom(null);
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
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
                      <label htmlFor={inputId} className="text-sm font-semibold">
                        Video {index + 1}
                      </label>
                      <div className="ml-auto flex gap-2">
                        <MoveButtons
                          name={`video ${index + 1}`}
                          index={index}
                          count={rows.length}
                          onMove={(delta) => {
                            setStatus({ type: 'idle' });
                            setRows((prev) => moveItem(prev, index, delta));
                          }}
                        />
                        <IconButton
                          label={`Remove video ${index + 1}`}
                          disabled={rows.length === 1}
                          onClick={() => {
                            setStatus({ type: 'idle' });
                            setRows((prev) => prev.filter((item) => item.key !== row.key));
                          }}
                          className="text-[var(--a-danger)]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                      {link.ok && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={youTubeThumbnail(link.id)}
                          alt=""
                          width={120}
                          height={68}
                          loading="lazy"
                          className="h-[68px] w-[120px] shrink-0 rounded-md border border-[var(--a-line)] object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          id={inputId}
                          type="url"
                          inputMode="url"
                          autoComplete="off"
                          spellCheck={false}
                          value={row.url}
                          onChange={(event) => update(index, { url: event.target.value, serverError: undefined })}
                          onBlur={() => update(index, { touched: true })}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? errorId : undefined}
                          placeholder="https://www.youtube.com/watch?v=…"
                          className={`${FIELD_CLASS} w-full`}
                        />
                        {error && (
                          <p id={errorId} className="text-sm text-[var(--a-danger)]">
                            {error}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={() => setRows((prev) => [...prev, newRow()])}
                disabled={rows.length >= MAX_VIDEOS}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add a video
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:gap-4">
                <Button type="submit" variant="primary" inactive={saving || !dirty}>
                  {saving ? 'Saving…' : 'Save videos'}
                </Button>
                <StatusMessage status={status} />
                {dirty && status.type === 'idle' && (
                  <p className="text-sm text-[var(--a-warning)]">Unsaved changes</p>
                )}
              </div>
            </div>
          </form>
        )}
      </Panel>

      {firstPlayable && (
        <Panel
          title="Preview"
          description="The first video, as the counter screen plays it."
          actions={
            <a
              href={firstPlayable.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Open on YouTube <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          }
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--a-line)] bg-[var(--a-ink)]">
            {previewing ? (
              <iframe
                key={firstPlayable.id}
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${firstPlayable.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${firstPlayable.id}&rel=0&playsinline=1`}
                title="Preview of the first video"
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPreviewing(true)}
                className="group absolute inset-0 grid place-items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youTubeThumbnail(firstPlayable.id)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--a-surface)] px-5 font-semibold text-[var(--a-ink)] shadow group-hover:bg-[var(--a-sunken)]">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Play preview
                </span>
              </button>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
