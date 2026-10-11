'use client';

import { useEffect, useId, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { CHAPTERS, type ChapterId } from '@/lib/site-navigation';
import { SECTION_LABELS } from './SiteHeader';
import styles from './MobileBar.module.css';

/** Phones only: a fixed bottom bar with Order online, and a section sheet behind the menu button. */
export default function MobileBar({ sections, onOrder }: { sections: ChapterId[]; onOrder: () => void }) {
  const [open, setOpen] = useState(false);
  const sheetId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={styles.wrap}>
      {open && (
        <nav id={sheetId} aria-label="Sections" className={styles.sheet}>
          {sections.map((id) => (
            <a key={id} href={CHAPTERS[id].hash} onClick={() => setOpen(false)}>
              {SECTION_LABELS[id]}
            </a>
          ))}
        </nav>
      )}
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.toggle}
          aria-label={open ? 'Close sections' : 'Open sections'}
          aria-expanded={open}
          aria-controls={open ? sheetId : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} strokeWidth={2.4} aria-hidden="true" /> : <Menu size={22} strokeWidth={2.4} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className={`b-pill b-pill--gold ${styles.order}`}
          onClick={() => {
            setOpen(false);
            onOrder();
          }}
        >
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
