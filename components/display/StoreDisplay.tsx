'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { preconnect } from 'react-dom';
import BrandLogo from '@/components/site/BrandLogo';
import type { DisplayPlaylist, DisplayStatus } from '@/lib/display';
import { openState, type OpenState } from '@/lib/site-hours';
import '@/components/site/site.css';
import styles from './StoreDisplay.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** What the screen is doing. Anything but `playing` shows the brand card, never black. */
type Phase = 'starting' | 'playing' | 'recovering' | 'blocked' | 'unplayable';
type Reason = Exclude<DisplayStatus, 'ok'> | Exclude<Phase, 'playing'>;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const POLL_OK_MS = MINUTE;
const POLL_RETRY_MS = 30 * SECOND;
const POLL_TIMEOUT_MS = 10 * SECOND;
const API_TIMEOUT_MS = 20 * SECOND;
const READY_TIMEOUT_MS = 20 * SECOND;
const PLAY_TIMEOUT_MS = 30 * SECOND;
const WATCHDOG_MS = 10 * SECOND;
const BUFFER_STALL_MS = 45 * SECOND;
// Ads freeze the video clock while PLAYING, so a frozen clock gets longer.
const FROZEN_PLAY_MS = 3 * MINUTE;
const HEALTHY_RESET_MS = 10 * MINUTE;
const REBUILD_BACKOFF_MS = [5 * SECOND, 30 * SECOND, MINUTE, 2 * MINUTE, 5 * MINUTE, 15 * MINUTE];
const UNPLAYABLE_AFTER_FAILURES = 3;
const NIGHTLY_RELOAD_HOUR = 4; // Invercargill time
const RELOAD_RETRY_MS = 5 * MINUTE;

let apiPromise: Promise<any> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      window.onYouTubeIframeAPIReady = undefined;
      apiPromise = null;
      reject(new Error('YouTube did not load'));
    };
    const timer = window.setTimeout(fail, API_TIMEOUT_MS);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      resolve(window.YT);
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** Milliseconds until the next 4 am in Invercargill, whatever the device clock zone. */
function msUntilNightlyReload(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const elapsed = get('hour') * 3600 + get('minute') * 60 + get('second');
  const wait = (NIGHTLY_RELOAD_HOUR * 3600 - elapsed + 86400) % 86400;
  return (wait || 86400) * SECOND;
}

/** Reload only when the page can actually be fetched; a reload while offline strands the browser. */
async function reloadIfReachable() {
  try {
    const response = await fetch(window.location.pathname, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5 * SECOND),
    });
    if (response.ok) {
      window.location.reload();
      return true;
    }
  } catch {
    // Not reachable; the in-page fallback keeps the screen on brand.
  }
  return false;
}

const STAFF_HINTS: Partial<Record<Reason, string>> = {
  empty: 'Staff: add videos in Admin → In-store videos.',
  unplayable:
    'Staff: none of the saved videos can play here. Check the links in Admin → In-store videos.',
  unavailable:
    'Staff: the video settings can’t be reached right now. This screen will keep trying by itself.',
  blocked:
    'Staff: YouTube isn’t loading on this network. This screen will keep trying by itself.',
  recovering: 'Staff: the videos are reconnecting. This screen will keep trying by itself.',
};

function Brand({ reason, hours }: { reason?: Reason; hours: OpenState | null }) {
  const hint = reason ? STAFF_HINTS[reason] : undefined;
  return (
    <div className={styles.brand}>
      <BrandLogo className={styles.logo} sizes="20vmin" priority />
      <h1 className={styles.headline}>
        BIG FLAVOUR. <em>Bali soul.</em>
      </h1>
      <p className={styles.details}>
        {hours?.open === false ? 'Find us at T.29, Esk Eats' : 'Order at the counter, T.29'}
        {hours && <span>{hours.label}</span>}
      </p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

export default function StoreDisplay({
  initial,
  themeStyle,
}: {
  initial: DisplayPlaylist;
  themeStyle?: CSSProperties;
}) {
  preconnect('https://www.youtube.com');
  preconnect('https://www.youtube-nocookie.com');
  preconnect('https://i.ytimg.com');

  const [playlist, setPlaylist] = useState(initial);
  const [phase, setPhase] = useState<Phase>('starting');
  const [build, setBuild] = useState(0);
  const [hours, setHours] = useState<OpenState | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>('starting');
  const failuresRef = useRef(0);
  const everPlayedRef = useRef(false);
  const resumeIndexRef = useRef(0);
  const retryTimerRef = useRef(0);
  const idsKey = playlist.ids.join(',');
  phaseRef.current = phase;

  useEffect(() => {
    const update = () => setHours(openState(undefined, false));
    update();
    const timer = window.setInterval(update, MINUTE);
    return () => window.clearInterval(timer);
  }, []);

  /** Tear-down happens in the player effect; this decides when and how to try again. */
  const scheduleRebuild = useCallback((reason: 'blocked' | 'recovering' | 'unplayable') => {
    window.clearTimeout(retryTimerRef.current);
    failuresRef.current += 1;
    const failures = failuresRef.current;
    const deadList =
      reason === 'unplayable' ||
      (reason === 'recovering' && !everPlayedRef.current && failures >= UNPLAYABLE_AFTER_FAILURES);
    setPhase(deadList ? 'unplayable' : reason);
    const delay = deadList
      ? REBUILD_BACKOFF_MS[REBUILD_BACKOFF_MS.length - 1]
      : REBUILD_BACKOFF_MS[Math.min(failures - 1, REBUILD_BACKOFF_MS.length - 1)];
    console.warn(`[store-display] ${deadList ? 'unplayable' : reason}; retrying in ${Math.round(delay / SECOND)}s (attempt ${failures})`);
    retryTimerRef.current = window.setTimeout(() => setBuild((count) => count + 1), delay);
  }, []);

  // A new playlist starts fresh.
  useEffect(() => {
    failuresRef.current = 0;
    everPlayedRef.current = false;
    resumeIndexRef.current = 0;
  }, [idsKey]);

  // Pick up playlist edits and recover from outages without a person.
  useEffect(() => {
    let timer = 0;
    let stopped = false;
    let inFlight = false;
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      if (!stopped) timer = window.setTimeout(check, ms);
    };
    const check = async () => {
      if (inFlight) return;
      inFlight = true;
      let ok = false;
      try {
        const response = await fetch('/api/display', {
          cache: 'no-store',
          signal: AbortSignal.timeout(POLL_TIMEOUT_MS),
        });
        if (response.ok) {
          const next = (await response.json()) as DisplayPlaylist;
          ok = next.status === 'ok';
          setPlaylist((current) => {
            // Settings briefly unreachable: keep playing what already works.
            if (next.status === 'unavailable' && current.status === 'ok') return current;
            return current.status === next.status && current.ids.join(',') === next.ids.join(',')
              ? current
              : next;
          });
        }
      } catch {
        // A network blip keeps the current playlist playing.
      } finally {
        inFlight = false;
      }
      schedule(ok ? POLL_OK_MS : POLL_RETRY_MS);
    };
    const onOnline = () => {
      // Back online: check settings and give the player a fresh start straight away.
      if (phaseRef.current !== 'playing') {
        failuresRef.current = 0;
        window.clearTimeout(retryTimerRef.current);
        setBuild((count) => count + 1);
      }
      void check();
    };
    schedule(initial.status === 'ok' ? POLL_OK_MS : POLL_RETRY_MS);
    window.addEventListener('online', onOnline);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener('online', onOnline);
    };
  }, [initial.status]);

  // A fresh page once a night clears slow memory growth, but only if the server answers.
  useEffect(() => {
    let timer = 0;
    let retries = 0;
    const attempt = async () => {
      if (await reloadIfReachable()) return;
      retries += 1;
      if (retries < 12) {
        timer = window.setTimeout(attempt, RELOAD_RETRY_MS);
      } else {
        retries = 0;
        timer = window.setTimeout(attempt, msUntilNightlyReload());
      }
    };
    timer = window.setTimeout(attempt, msUntilNightlyReload());
    return () => window.clearTimeout(timer);
  }, []);

  // Player with ready and play deadlines, error skipping and a stall watchdog.
  useEffect(() => {
    if (playlist.status !== 'ok' || !playlist.ids.length || !hostRef.current) return;
    const ids = playlist.ids;
    let YT: any = null;
    let player: any = null;
    let ready = false;
    let disposed = false;
    let errors = 0;
    let lastTime = -1;
    let stalledFor = 0;
    let frozenFor = 0;
    let healthySince = 0;
    let readyTimer = 0;
    let playTimer = 0;
    let watchdog = 0;

    if (phaseRef.current === 'playing') setPhase('recovering');
    const mount = document.createElement('div');
    hostRef.current.replaceChildren(mount);

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(readyTimer);
      window.clearTimeout(playTimer);
      window.clearInterval(watchdog);
      try {
        player?.destroy?.();
      } catch {
        // The iframe may already be gone.
      }
      player = null;
    };
    const fail = (reason: 'blocked' | 'recovering' | 'unplayable') => {
      if (disposed) return;
      dispose();
      scheduleRebuild(reason);
    };

    loadYouTubeApi()
      .then((api) => {
        if (disposed) return;
        YT = api;
        readyTimer = window.setTimeout(() => fail('blocked'), READY_TIMEOUT_MS);
        player = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              if (disposed) return;
              ready = true;
              window.clearTimeout(readyTimer);
              event.target.getIframe()?.setAttribute('title', 'Balibu in-store video playlist');
              event.target.mute();
              event.target.loadPlaylist({ playlist: ids, index: resumeIndexRef.current % ids.length });
              event.target.setLoop(true);
              playTimer = window.setTimeout(() => {
                if (disposed || player?.getPlayerState?.() === YT.PlayerState.PLAYING) return;
                // YouTube quietly cues an empty list when every video is gone.
                const queued = player?.getPlaylist?.();
                fail(Array.isArray(queued) && queued.length === 0 ? 'unplayable' : 'recovering');
              }, PLAY_TIMEOUT_MS);
            },
            onStateChange: (event: any) => {
              if (disposed || event.data !== YT.PlayerState.PLAYING) return;
              window.clearTimeout(playTimer);
              errors = 0;
              everPlayedRef.current = true;
              healthySince ||= Date.now();
              setPhase('playing');
            },
            onError: (event: any) => {
              errors += 1;
              if (errors >= ids.length) fail('unplayable');
              else event.target.nextVideo();
            },
          },
        });
        watchdog = window.setInterval(() => {
          if (disposed || !ready || !player?.getPlayerState) return;
          const state = player.getPlayerState();
          const time = player.getCurrentTime?.() ?? 0;
          const index = player.getPlaylistIndex?.();
          if (typeof index === 'number' && index >= 0) resumeIndexRef.current = index;
          if (state === YT.PlayerState.PLAYING) {
            stalledFor = 0;
            if (time !== lastTime) {
              frozenFor = 0;
              if (healthySince && Date.now() - healthySince > HEALTHY_RESET_MS) failuresRef.current = 0;
            } else if ((frozenFor += WATCHDOG_MS) >= FROZEN_PLAY_MS) {
              fail('recovering');
            }
          } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED) {
            // Nobody is here to press play.
            player.playVideo?.();
          } else {
            healthySince = 0;
            if ((stalledFor += WATCHDOG_MS) >= BUFFER_STALL_MS) fail('recovering');
          }
          lastTime = time;
        }, WATCHDOG_MS);
      })
      .catch(() => fail('blocked'));

    return dispose;
  }, [idsKey, playlist.status, build, scheduleRebuild]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => window.clearTimeout(retryTimerRef.current), []);

  const reason: Reason | undefined =
    playlist.status !== 'ok' ? playlist.status : phase !== 'playing' ? phase : undefined;

  return (
    <main
      className={`balibu-site ${styles.screen}`}
      style={themeStyle}
      data-state={reason ? 'fallback' : 'video'}
      data-reason={reason}
    >
      <div className={styles.video} ref={hostRef} aria-hidden={Boolean(reason)} />
      {reason ? (
        <div className={styles.fallback}>
          <Brand reason={reason} hours={hours} />
        </div>
      ) : (
        <div className={styles.portraitBrand}>
          <Brand hours={hours} />
        </div>
      )}
    </main>
  );
}
