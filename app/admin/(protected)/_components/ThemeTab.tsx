'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import '@/components/site/site.css';
import {
  THEME_BASE,
  THEME_FIELDS,
  normalizeHex,
  resolveTheme,
  type EditableThemeKey,
} from '@/lib/site-theme';
import { adminRequest } from './adminRequest';
import { AdminDialog, Button, FIELD_CLASS, Panel, StatusMessage, type Status } from './ui';

type Colours = Record<EditableThemeKey, string>;
type Overrides = Partial<Colours>;

const KEYS = THEME_FIELDS.map((field) => field.key);

function toOverrides(colours: Colours): Overrides {
  const overrides: Overrides = {};
  for (const key of KEYS) {
    const value = normalizeHex(colours[key]);
    if (value && value !== THEME_BASE[key]) overrides[key] = value;
  }
  return overrides;
}

function fromOverrides(overrides: Record<string, string | undefined>): Colours {
  const colours = { ...THEME_BASE } as Colours;
  for (const key of KEYS) {
    const value = normalizeHex(overrides[key]);
    if (value) colours[key] = value;
  }
  return colours;
}

const sameOverrides = (a: Overrides, b: Overrides) =>
  KEYS.every((key) => (a[key] ?? '') === (b[key] ?? ''));

export default function ThemeTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [saved, setSaved] = useState<Overrides>({});
  // Older settings the website no longer uses; kept so a save never loses data silently.
  const [legacy, setLegacy] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Colours>({ ...THEME_BASE });
  const [hexText, setHexText] = useState<Colours>({ ...THEME_BASE });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [confirmReset, setConfirmReset] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    const result = await adminRequest<{ overrides: Record<string, string> }>('/api/admin/theme');
    if (result.ok) {
      const loaded = result.data.overrides ?? {};
      setLegacy(
        Object.fromEntries(
          Object.entries(loaded).filter(([key]) => !KEYS.includes(key as EditableThemeKey)),
        ),
      );
      const colours = fromOverrides(loaded);
      setSaved(toOverrides(colours));
      setDraft(colours);
      setHexText(colours);
    } else {
      setLoadError(result.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const draftOverrides = useMemo(() => toOverrides(draft), [draft]);
  const { checks, vars } = useMemo(() => resolveTheme(draftOverrides), [draftOverrides]);
  const dirty = !loading && !loadError && !sameOverrides(draftOverrides, saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  const rejected = KEYS.filter((key) => checks[key].problem);
  const savedCount = Object.keys(saved).length;

  const setColour = (key: EditableThemeKey, value: string) => {
    setStatus({ type: 'idle' });
    setDraft((prev) => ({ ...prev, [key]: value }));
    setHexText((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setStatus({ type: 'idle' });
    const result = await adminRequest<{ overrides: Overrides }>('/api/admin/theme', {
      method: 'POST',
      body: JSON.stringify({ overrides: { ...legacy, ...draftOverrides } }),
    });
    setSaving(false);
    if (!result.ok) {
      setStatus({ type: 'error', message: result.message });
      return;
    }
    setSaved(toOverrides(fromOverrides(result.data.overrides ?? {})));
    setStatus({
      type: 'success',
      message: rejected.length
        ? 'Saved. Colours marked “Won’t show” stay Balibu’s until you pick a more readable one.'
        : 'Saved. The website shows your colours from the next page load.',
    });
  };

  const reset = async () => {
    setSaving(true);
    const result = await adminRequest('/api/admin/theme', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset' }),
    });
    setSaving(false);
    setConfirmReset(false);
    if (!result.ok) {
      setStatus({ type: 'error', message: result.message });
      return;
    }
    setSaved({});
    setLegacy({});
    setDraft({ ...THEME_BASE });
    setHexText({ ...THEME_BASE });
    setStatus({ type: 'success', message: 'The website is back to Balibu’s colours.' });
  };

  return (
    <Panel
      title="Colours"
      description="Change the website’s colours. Anything you leave alone keeps Balibu’s own colour. Colours that would make text hard to read are not used on the website."
      actions={
        <Button onClick={() => setConfirmReset(true)} disabled={loading || saving || savedCount === 0}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Use Balibu’s colours
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--a-muted)]" role="status">
          Loading colours…
        </p>
      ) : loadError ? (
        <div className="space-y-3" role="alert">
          <p className="text-sm font-semibold text-[var(--a-danger)]">{loadError}</p>
          <Button onClick={() => void load()}>Try again</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            {THEME_FIELDS.map((field) => {
              const check = checks[field.key];
              const id = `colour-${field.key}`;
              const problemId = `${id}-problem`;
              const hexErrorId = `${id}-hex-error`;
              const descriptionId = `${id}-description`;
              const hexValid = Boolean(normalizeHex(hexText[field.key]));
              return (
                <fieldset
                  key={field.key}
                  className={`relative space-y-3 rounded-xl border bg-[var(--a-sunken)] p-4 ${
                    check.problem ? 'border-[var(--a-warning)]' : 'border-[var(--a-line)]'
                  }`}
                  aria-describedby={[descriptionId, check.problem && problemId].filter(Boolean).join(' ')}
                >
                  {/* First child, so it names the group for screen readers. */}
                  <legend className="float-left w-full pr-28 text-sm font-semibold">{field.label}</legend>
                  <p id={descriptionId} className="clear-both !mt-0 pr-2 text-sm text-[var(--a-muted)]">
                    {field.description}
                  </p>
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        check.problem
                          ? 'bg-[var(--a-warning-soft)] text-[var(--a-warning)]'
                          : check.custom
                            ? 'bg-[var(--a-success-soft)] text-[var(--a-success)]'
                            : 'bg-[var(--a-surface)] text-[var(--a-muted)] border border-[var(--a-line)]'
                      }`}
                    >
                      {check.problem ? 'Won’t show' : check.custom ? 'Your colour' : 'Balibu colour'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      id={id}
                      type="color"
                      value={draft[field.key]}
                      onChange={(event) => setColour(field.key, event.target.value)}
                      aria-label={`${field.label} colour picker`}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-[var(--a-line)] bg-[var(--a-surface)] p-1"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--a-muted)]" aria-hidden="true">
                        Hex code
                      </span>
                      <input
                        type="text"
                        aria-label={`${field.label} hex code`}
                        aria-describedby={hexValid ? undefined : hexErrorId}
                        value={hexText[field.key]}
                        onChange={(event) => {
                          const text = event.target.value.trim();
                          setHexText((prev) => ({ ...prev, [field.key]: text }));
                          const value = normalizeHex(text);
                          if (value) {
                            setStatus({ type: 'idle' });
                            setDraft((prev) => ({ ...prev, [field.key]: value }));
                          }
                        }}
                        onBlur={() => setHexText((prev) => ({ ...prev, [field.key]: draft[field.key] }))}
                        aria-invalid={!hexValid}
                        spellCheck={false}
                        autoComplete="off"
                        className={`${FIELD_CLASS} w-32 font-mono`}
                      />
                    </label>
                    {check.custom && (
                      <Button
                        variant="ghost"
                        onClick={() => setColour(field.key, THEME_BASE[field.key])}
                        aria-label={`Use Balibu colour for ${field.label}`}
                      >
                        Use Balibu colour
                      </Button>
                    )}
                  </div>
                  <div aria-live="polite">
                    {!hexValid && (
                      <p id={hexErrorId} className="text-sm text-[var(--a-danger)]">
                        Use a hex code like #bd422d or #fff. Leaving this box puts back the last colour that worked.
                      </p>
                    )}
                  </div>
                  {check.problem && (
                    <p id={problemId} className="flex gap-2 text-sm text-[var(--a-warning)]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {check.problem}
                    </p>
                  )}
                </fieldset>
              );
            })}
          </div>

          <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
            <h3 className="text-sm font-semibold">How the website will look</h3>
            <ThemePreview vars={vars} />
          </div>
          {/* Sticky so Save is always within reach on a phone, however far down the colours go. */}
          <div className="sticky bottom-0 z-10 -mx-5 -mb-5 flex flex-col gap-2 border-t border-[var(--a-line)] bg-[var(--a-surface)] px-5 py-3 sm:-mx-6 sm:-mb-6 sm:flex-row sm:items-center sm:gap-4 sm:px-6 rounded-b-2xl lg:col-span-2">
            <Button variant="primary" onClick={() => void save()} inactive={saving || !dirty}>
              {saving ? 'Saving…' : 'Save colours'}
            </Button>
            {dirty && status.type === 'idle' && <p className="text-sm text-[var(--a-warning)]">Unsaved changes</p>}
            <StatusMessage status={status} />
          </div>
        </div>
      )}

      <AdminDialog open={confirmReset} title="Go back to Balibu’s colours?" onClose={() => setConfirmReset(false)}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--a-muted)]">
            This removes your {savedCount === 1 ? 'custom colour' : `${savedCount} custom colours`} from the
            website straight away.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setConfirmReset(false)}>Keep my colours</Button>
            <Button variant="danger" onClick={() => void reset()} disabled={saving}>
              {saving ? 'Resetting…' : 'Use Balibu’s colours'}
            </Button>
          </div>
        </div>
      </AdminDialog>
    </Panel>
  );
}

function ThemePreview({ vars }: { vars: CSSProperties }) {
  return (
    <div
      className="balibu-site overflow-hidden rounded-xl border border-[var(--a-line)]"
      style={vars}
      aria-label="Colour preview"
      role="img"
    >
      <div style={{ padding: 24, background: 'var(--b-paper)' }}>
        <p
          style={{
            fontFamily: 'var(--font-display), Impact, sans-serif',
            fontSize: 38,
            lineHeight: 1.05,
            color: 'var(--b-heading)',
          }}
        >
          BIG FLAVOUR.{' '}
          <em style={{ fontFamily: 'var(--b-script)', fontStyle: 'normal', color: 'var(--b-accent)' }}>Bali soul.</em>
        </p>
        <p style={{ marginTop: 10, fontSize: 14, color: 'var(--b-muted)' }}>
          Nasi goreng, mie goreng, rendang and bakso.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <span
            style={{
              padding: '12px 14px',
              borderRadius: 3,
              background: 'var(--b-accent)',
              color: 'var(--b-on-accent)',
              fontFamily: 'var(--font-display), Impact, sans-serif',
              fontSize: 20,
            }}
          >
            THE MENU.
          </span>
          <span
            style={{
              padding: '12px 16px',
              borderRadius: 2,
              background: 'var(--b-ink)',
              color: 'var(--b-on-ink)',
              fontSize: 13,
              fontWeight: 700,
              alignSelf: 'center',
            }}
          >
            Order online
          </span>
        </div>
      </div>
      <div style={{ padding: '16px 24px', background: 'var(--b-ink)', color: 'var(--b-on-ink)' }}>
        <span style={{ fontFamily: 'var(--b-sign)', fontSize: 20 }}>
          MEET YOU <em style={{ fontFamily: 'var(--b-script)', fontStyle: 'normal', color: 'var(--b-gold)' }}>at the counter.</em>
        </span>
      </div>
    </div>
  );
}
