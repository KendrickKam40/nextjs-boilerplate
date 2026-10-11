import { Phone } from 'lucide-react';
import type { OpenState } from '@/lib/site-hours';
import { BALIBU_LOCATION } from '@/lib/site-location';
import BrandLogo from './BrandLogo';
import OpenChip from './OpenChip';
import styles from './SiteFooter.module.css';

/** Ink footer under a woven band: logo, address and hours, phone and open state. */
export default function SiteFooter({ openNow }: { openNow: OpenState | null }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.stripe} aria-hidden="true" />
      <div className={styles.row}>
        <div className={styles.logo}>
          <BrandLogo tone="light" sizes="84px" />
        </div>
        <div className={styles.where}>
          <p className={styles.address}>{BALIBU_LOCATION.address.replace(/, New Zealand$/, '')}</p>
          <p className={styles.hours}>{BALIBU_LOCATION.hours.join(' · ')}</p>
        </div>
        <div className={styles.contact}>
          <a href={BALIBU_LOCATION.phoneHref} className={styles.phone}>
            <Phone size={18} aria-hidden="true" /> {BALIBU_LOCATION.phone}
          </a>
          <OpenChip state={openNow} />
        </div>
      </div>
    </footer>
  );
}
