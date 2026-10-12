'use client';

import { Fragment, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { DEFAULT_LAYOUTS } from '@/lib/layout-config';
import { CHAPTERS, type ChapterId } from '@/lib/site-navigation';
import { SAVOURY_DISHES, SWEET_DISHES, type CommerceMode } from '@/lib/site-content';
import { HOME_THEME, themeVariables } from '@/lib/site-theme';
import CommerceDialog, { COMMERCE_DESTINATIONS } from './CommerceDialog';
import DishSection from './DishSection';
import MobileBar from './MobileBar';
import SignboardHero from './SignboardHero';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
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

const SWEET_WORDS = ['Milkshakes', 'Smoothies', 'Slushies', 'Dirty soda', 'Soft serve', 'Fully Loaded Sundae'];

/** The whole Balibu homepage: signboard hero, dish tiles, story and visit, wired to live POS data from /api/client. */
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
  const hoursLabel = openNow?.label ?? 'Open every day, 10 am – 9 pm';

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className={`balibu-site ${styles.site}`} style={themeVariables(data?.themeOverrides, HOME_THEME)}>
        <a className="b-skip-link" href="#main-content">
          Skip to content
        </a>
        {announcement && <p className={styles.announcement}>{announcement}</p>}
        <SiteHeader sections={sections} openNow={openNow} onOrder={onOrder} />
        <p className={styles.strip}>
          {hoursLabel} at Esk Eats, Invercargill.{' '}
          <button type="button" onClick={onOrder}>
            Order online ›
          </button>
        </p>

        <main id="main-content" tabIndex={-1} className={styles.main}>
          <SignboardHero onOrder={onOrder} />
          {sections.map((id) => (
            <Fragment key={id}>
              {id === 'menu' && (
                <DishSection
                  id="menu"
                  tone="savoury"
                  title="New here? Start with these."
                  intro="Indonesian comfort food. Tap a dish to order."
                  dishes={SAVOURY_DISHES}
                  onOrder={onOrder}
                />
              )}
              {id === 'flavours' && (
                <>
                  <Ticker tone="cream" words={SWEET_WORDS} label="Milkshakes, smoothies, slushies, dirty soda, soft serve and the Fully Loaded Sundae." />
                  <DishSection
                    id="flavours"
                    tone="sweet"
                    title="Then a milkshake, because you’ve earned it."
                    intro="Drinks and desserts, as serious as the food."
                    dishes={SWEET_DISHES}
                    onOrder={onOrder}
                  />
                </>
              )}
              {id === 'story' && <StorySection client={data?.client} onOrder={onOrder} />}
              {id === 'visit' && (
                <>
                  <Ticker
                    tone="gold"
                    words={[openNow?.label ?? 'Open 10 am – 9 pm', 'Esk Eats, Invercargill']}
                    label={`${hoursLabel}, at Esk Eats, Invercargill Central.`}
                  />
                  <VisitScene client={data?.client} onBooking={onBooking} onOrder={onOrder} openNow={openNow} />
                </>
              )}
            </Fragment>
          ))}
        </main>

        <SiteFooter openNow={openNow} />
        <MobileBar sections={sections} onOrder={onOrder} />
        <CommerceDialog mode={mode} onClose={() => setMode(null)} openNow={openNow} />
      </div>
    </MotionConfig>
  );
}
