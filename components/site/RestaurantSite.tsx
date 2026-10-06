'use client';

import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ArrowUpRight, Phone } from 'lucide-react';
import { DEFAULT_LAYOUTS } from '@/lib/layout-config';
import { CHAPTERS, type ChapterId } from '@/lib/site-navigation';
import type { CommerceMode } from '@/lib/site-content';
import { BALIBU_LOCATION } from '@/lib/site-location';
import { themeVariables } from '@/lib/site-theme';
import BrandLogo from './BrandLogo';
import CommerceDialog, { COMMERCE_DESTINATIONS } from './CommerceDialog';
import FeatureSection from './FeatureSection';
import Hero from './Hero';
import MenuSection from './MenuSection';
import OpenChip from './OpenChip';
import StorySection from './StorySection';
import Ticker from './Ticker';
import VisitScene from './VisitScene';
import { useOpenState } from './useOpenState';
import { useRestaurant } from './useRestaurant';
import styles from './RestaurantSite.module.css';
import './site.css';

// Phones get the provider's full page (native Back, wallets, autofill)
// instead of a full-screen iframe that cannot report its own errors.
const SAME_TAB_QUERY = '(max-width: 700px)';

const NAV_LABELS: Record<ChapterId, string> = {
  menu: 'Menu',
  flavours: 'Featured',
  story: 'Our story',
  visit: 'Visit',
};

export default function RestaurantSite() {
  const { data, status, layout } = useRestaurant();
  const openNow = useOpenState(data?.client, status === 'live');
  const [mode, setMode] = useState<CommerceMode>(null);

  const openCommerce = (next: Exclude<CommerceMode, null>) => {
    if (window.matchMedia(SAME_TAB_QUERY).matches) {
      window.location.assign(COMMERCE_DESTINATIONS[next].url);
    } else {
      setMode(next);
    }
  };
  const onOrder = () => openCommerce('order');
  const onBooking = data?.client.bookingAccess ? () => openCommerce('booking') : undefined;

  // Admin decides which sections show, and in what order.
  const items = layout?.items ?? DEFAULT_LAYOUTS.home.items;
  const sections = items
    .filter((item) => item.enabled)
    .flatMap((item) => {
      const id = (Object.keys(CHAPTERS) as ChapterId[]).find((key) => CHAPTERS[key].section === item.id);
      return id ? [id] : [];
    });
  const announcement = items.some((item) => item.id === 'ticker' && item.enabled)
    ? data?.client.kioskMessage?.trim()
    : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className={`balibu-site ${styles.site}`} style={themeVariables(data?.themeOverrides)}>
        <a className="b-skip-link" href="#main-content">
          Skip to content
        </a>
        {announcement && <p className={styles.announcement}>{announcement}</p>}
        <header className={styles.bar}>
          <a href="#top" className={styles.brand} aria-label="Balibu, back to top">
            <BrandLogo className={styles.logo} sizes="64px" priority />
          </a>
          <nav aria-label="Sections" className={styles.nav}>
            {sections.map((id) => (
              <a key={id} href={CHAPTERS[id].hash}>
                {NAV_LABELS[id]}
              </a>
            ))}
          </nav>
          <button type="button" className={`b-pill b-pill--cream ${styles.barOrder}`} onClick={onOrder}>
            Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <main id="main-content" tabIndex={-1} className={styles.main}>
          <Hero openNow={openNow} onOrder={onOrder} />
          <Ticker />
          {sections.map((id) => (
            <div key={id} className={styles.section}>
              {id === 'menu' && <MenuSection data={data} onOrder={onOrder} />}
              {id === 'flavours' && <FeatureSection menuItems={data?.menuItems} onOrder={onOrder} />}
              {id === 'story' && <StorySection client={data?.client} onOrder={onOrder} />}
              {id === 'visit' && (
                <VisitScene client={data?.client} onBooking={onBooking} onOrder={onOrder} openNow={openNow} />
              )}
            </div>
          ))}
        </main>

        <footer className={styles.footer}>
          <Ticker />
          <div className={styles.footerBody}>
            <p className={`${styles.footerSign} b-painted`}>
              SEE YOU AT <span>T.29</span>
            </p>
            <p className={`${styles.footerScript} b-script`}>Esk Eats, Invercargill Central</p>
            <div className={styles.footerRow}>
              <button type="button" className="b-pill b-pill--gold" onClick={onOrder}>
                Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <a className={styles.footerLink} href={BALIBU_LOCATION.phoneHref}>
                <Phone size={18} aria-hidden="true" /> {BALIBU_LOCATION.phone}
              </a>
              <OpenChip state={openNow} className={styles.footerOpen} />
            </div>
            <p className={styles.small}>
              {BALIBU_LOCATION.address} · {BALIBU_LOCATION.hours.join(' · ')}
            </p>
          </div>
        </footer>

        {/* Phones: ordering stays under the thumb. */}
        <div className={styles.mobileOrder}>
          <button type="button" className="b-pill b-pill--gold" onClick={onOrder}>
            Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <CommerceDialog mode={mode} onClose={() => setMode(null)} openNow={openNow} />
      </div>
    </MotionConfig>
  );
}
