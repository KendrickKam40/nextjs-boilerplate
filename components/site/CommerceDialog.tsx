'use client';

import { ArrowUpRight, LoaderCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { OpenState } from '@/lib/site-hours';
import styles from './CommerceDialog.module.css';
import BrandLogo from './BrandLogo';
import OpenChip from './OpenChip';

type CommerceDialogProps = {
  mode: 'order' | 'booking' | null;
  onClose: () => void;
  openNow?: OpenState | null;
};

export const COMMERCE_DESTINATIONS = {
  order: {
    url: 'https://ordering.balibu.co.nz/',
    title: 'Good food. Coming right up.',
    label: 'Order online',
    loading: 'Warming up the menu…',
  },
  booking: {
    url: 'https://booking.balibu.co.nz/',
    title: 'There’s a seat for you.',
    label: 'Book a table',
    loading: 'Finding you a seat…',
  },
} as const;

const historyKey = '__balibuCommerceDialog';

/** Full-screen sheet that opens the online ordering or booking site in place. `mode: null` keeps it closed. */
export default function CommerceDialog({ mode, onClose, openNow }: CommerceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const id = useId();
  const isOpen = mode !== null;
  const [frameStatus, setFrameStatus] = useState<'loading' | 'ready' | 'slow'>(
    'loading',
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!mode) return;
    setFrameStatus('loading');
    const timeout = window.setTimeout(() => {
      setFrameStatus((status) => (status === 'loading' ? 'slow' : status));
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding =
        Number.parseFloat(
          window.getComputedStyle(document.body).paddingRight,
        ) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });

    let ownsHistoryEntry = false;
    // Defer the entry so React's development effect replay can cancel it cleanly.
    const historyTimer = window.setTimeout(() => {
      window.history.pushState(
        { ...window.history.state, [historyKey]: id },
        '',
      );
      ownsHistoryEntry = true;
    }, 0);

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.[historyKey] !== id) {
        ownsHistoryEntry = false;
        onCloseRef.current();
      }
    };
    window.addEventListener('popstate', handlePopState);

    const restoreFocus = () => {
      window.requestAnimationFrame(() => {
        if (
          !dialog.open &&
          previouslyFocused instanceof HTMLElement &&
          previouslyFocused.isConnected
        ) {
          previouslyFocused.focus({ preventScroll: true });
        }
      });
    };

    return () => {
      window.clearTimeout(historyTimer);
      window.removeEventListener('popstate', handlePopState);
      if (ownsHistoryEntry && window.history.state?.[historyKey] === id) {
        // History traversal can reset focus after popstate has been dispatched.
        window.addEventListener('popstate', restoreFocus, { once: true });
        window.history.back();
      }
      dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      restoreFocus();
    };
  }, [id, isOpen]);

  const destination = mode ? COMMERCE_DESTINATIONS[mode] : null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {destination && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.heading}>
              <BrandLogo
                className={styles.logo}
                sizes="(max-width: 700px) 64px, 80px"
              />
              <span className={styles.divider} aria-hidden="true" />
              <div>
                <h2 id={`${id}-title`} className={styles.title}>
                  {destination.title}
                </h2>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={`Close ${destination.label.toLowerCase()}`}
            >
              <X size={22} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.serviceBar}>
            <span className={styles.serviceInfo}>
              <span>Esk Eats · Invercargill Central</span>
              <OpenChip state={openNow ?? null} />
            </span>
            <a href={destination.url} target="_blank" rel="noopener noreferrer">
              Open in a new tab <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.frameContainer}>
            <iframe
              key={mode}
              className={styles.frame}
              src={destination.url}
              title={`Balibu — ${destination.label}`}
              allow="payment"
              onLoad={() => setFrameStatus('ready')}
              onError={() => setFrameStatus('slow')}
            />
            {frameStatus === 'loading' && (
              <div className={styles.loading} role="status">
                <LoaderCircle
                  className={styles.spinner}
                  size={30}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p>{destination.loading}</p>
                <span>Not loading? Use “Open in a new tab” above.</span>
              </div>
            )}
            {frameStatus === 'slow' && (
              <div className={styles.slowNotice} role="status">
                Taking a little longer? You can{' '}
                <a
                  href={destination.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  open in a new tab
                </a>
                .
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
