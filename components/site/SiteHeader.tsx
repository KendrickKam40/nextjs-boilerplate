import { ArrowUpRight } from 'lucide-react';
import type { OpenState } from '@/lib/site-hours';
import { CHAPTERS, type ChapterId } from '@/lib/site-navigation';
import BrandLogo from './BrandLogo';
import OpenChip from './OpenChip';
import styles from './SiteHeader.module.css';

export const SECTION_LABELS: Record<ChapterId, string> = {
  menu: 'Menu',
  flavours: 'Sweets',
  story: 'Our story',
  visit: 'Visit',
};

/** Sticky cream bar: logo, section links, open state and Order online. Phones keep the logo and open state; ordering moves to the bottom bar. */
export default function SiteHeader({
  sections,
  openNow,
  onOrder,
}: {
  sections: ChapterId[];
  openNow: OpenState | null;
  onOrder: () => void;
}) {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.brand} aria-label="Balibu, back to top">
        <BrandLogo className={styles.logo} sizes="54px" priority />
      </a>
      <nav aria-label="Sections" className={styles.nav}>
        {sections.map((id) => (
          <a key={id} href={CHAPTERS[id].hash}>
            {SECTION_LABELS[id]}
          </a>
        ))}
      </nav>
      <OpenChip state={openNow} />
      <button type="button" className={`b-pill b-pill--ink ${styles.order}`} onClick={onOrder}>
        Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </header>
  );
}
