'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, LayoutList, LogOut, Palette, Tv } from 'lucide-react';
import LayoutTab from './_components/LayoutTab';
import PlaylistTab from './_components/PlaylistTab';
import ThemeTab from './_components/ThemeTab';
import { SIGNED_IN_EVENT, SIGNED_OUT_EVENT } from './_components/adminRequest';
import { AdminDialog, Button } from './_components/ui';

type TabId = 'playlist' | 'theme' | 'layout';

const TABS: { id: TabId; label: string; icon: typeof Tv }[] = [
  { id: 'playlist', label: 'In-store videos', icon: Tv },
  { id: 'theme', label: 'Colours', icon: Palette },
  { id: 'layout', label: 'Homepage layout', icon: LayoutList },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState<TabId>('playlist');
  const [dirty, setDirty] = useState<Record<TabId, boolean>>({ playlist: false, theme: false, layout: false });
  const [signedOut, setSignedOut] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const [vertical, setVertical] = useState(false);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ playlist: null, theme: null, layout: null });
  const anyDirty = Object.values(dirty).some(Boolean);

  const setTabDirty = useCallback(
    (tab: TabId, value: boolean) =>
      setDirty((prev) => (prev[tab] === value ? prev : { ...prev, [tab]: value })),
    [],
  );
  const onPlaylistDirty = useCallback((value: boolean) => setTabDirty('playlist', value), [setTabDirty]);
  const onThemeDirty = useCallback((value: boolean) => setTabDirty('theme', value), [setTabDirty]);
  const onLayoutDirty = useCallback((value: boolean) => setTabDirty('layout', value), [setTabDirty]);

  // Unsaved edits survive tab switches; leaving the page asks first.
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [anyDirty]);

  useEffect(() => {
    const onSignedOut = () => setSignedOut(true);
    const onSignedIn = () => setSignedOut(false);
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    window.addEventListener(SIGNED_IN_EVENT, onSignedIn);
    return () => {
      window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
      window.removeEventListener(SIGNED_IN_EVENT, onSignedIn);
    };
  }, []);

  // Tabs stack in a column from the md breakpoint; tell assistive tech which way they run.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const sync = () => setVertical(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const signOut = async () => {
    setSignOutError('');
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
    } catch {
      setSignOutError('Couldn’t sign out. Check the internet connection and try again.');
      return;
    }
    setDirty({ playlist: false, theme: false, layout: false });
    router.push('/admin/login');
    router.refresh();
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : (index + delta + TABS.length) % TABS.length;
    setActive(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  return (
    <div className="min-h-svh">
      <header className="border-b border-[var(--a-line)] bg-[var(--a-surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-sm text-[var(--a-muted)]">Balibu</p>
            <h1 className="text-2xl font-bold">Website settings</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-[var(--a-sunken)]"
            >
              View website <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <Button onClick={() => (anyDirty ? setConfirmSignOut(true) : void signOut())}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
        {signOutError && (
          <p role="alert" className="mx-auto max-w-6xl px-4 pb-3 text-sm font-semibold text-[var(--a-danger)]">
            {signOutError}
          </p>
        )}
      </header>

      {signedOut && (
        <div role="alert" className="border-b border-[var(--a-warning)] bg-[var(--a-warning-soft)]">
          <div className="mx-auto flex min-w-0 max-w-6xl flex-wrap items-center gap-x-3 px-4 py-3 text-sm [overflow-wrap:anywhere]">
            <p className="font-semibold text-[var(--a-warning)]">
              {anyDirty
                ? 'You’ve been signed out, so nothing was saved. Your changes are still on this page.'
                : 'You’ve been signed out.'}
            </p>
            <a
              href="/admin/login"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              {anyDirty ? 'Sign in again in a new tab, then come back and save' : 'Sign in again in a new tab'}
            </a>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:py-8">
        <div className="md:w-60 md:shrink-0">
          <div
            role="tablist"
            aria-label="Settings"
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            className="grid grid-cols-3 gap-1 rounded-2xl border border-[var(--a-line)] bg-[var(--a-surface)] p-1.5 md:flex md:flex-col md:gap-2 md:p-2"
          >
            {TABS.map(({ id, label, icon: Icon }, index) => (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node;
                }}
                id={`tab-${id}`}
                type="button"
                role="tab"
                aria-selected={active === id}
                aria-controls={`panel-${id}`}
                tabIndex={active === id ? 0 : -1}
                onClick={() => setActive(id)}
                onKeyDown={(event) => onTabKey(event, index)}
                className={`relative flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-center text-sm font-semibold leading-tight md:w-full md:justify-start md:px-3 md:text-left ${
                  active === id
                    ? 'bg-[var(--a-primary)] text-[var(--a-on-primary)]'
                    : 'text-[var(--a-ink)] hover:bg-[var(--a-sunken)]'
                }`}
              >
                <Icon className="hidden h-4 w-4 shrink-0 md:block" aria-hidden="true" />
                {label}
                {dirty[id] && (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--a-warning)] md:static md:ml-auto"
                    title="Unsaved changes"
                  >
                    <span className="sr-only">(unsaved changes)</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <main className="min-w-0 flex-1">
          {TABS.map(({ id }) => (
            <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id}>
              {id === 'playlist' && <PlaylistTab onDirtyChange={onPlaylistDirty} />}
              {id === 'theme' && <ThemeTab onDirtyChange={onThemeDirty} />}
              {id === 'layout' && <LayoutTab onDirtyChange={onLayoutDirty} />}
            </div>
          ))}
        </main>
      </div>

      <AdminDialog open={confirmSignOut} title="Sign out without saving?" onClose={() => setConfirmSignOut(false)}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--a-muted)]">
            You have unsaved changes in{' '}
            {new Intl.ListFormat('en-NZ', { type: 'conjunction' }).format(
              TABS.filter(({ id }) => dirty[id]).map(({ label }) => label),
            )}
            . Signing out will lose them.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setConfirmSignOut(false)}>Stay and save</Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmSignOut(false);
                void signOut();
              }}
            >
              Sign out anyway
            </Button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}
