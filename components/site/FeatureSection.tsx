'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import type { MenuItem } from '@/lib/site-content';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import styles from './FeatureSection.module.css';
import { useMotionPreference } from './useMotionPreference';

const FLAVOURS = [
  {
    id: 'smoky',
    label: 'Smoky',
    name: 'A little char. A lot of character.',
    note: 'Charred chicken satay. Rich peanut sauce. Fresh lime. Big flavour, right to the last bite.',
    image: FOOD_IMAGES.floatingSatay,
    dish: 'Chicken satay',
  },
  {
    id: 'spicy',
    label: 'Spicy',
    name: 'Warmth you can settle into.',
    note: 'Golden coconut curry, aromatic leaves and chilli warmth. Made for spooning over rice.',
    image: FOOD_IMAGES.floatingCurry,
    dish: 'Coconut curry',
  },
  {
    id: 'sweet',
    label: 'Sweet',
    name: 'Fully loaded. Fully worth it.',
    note: 'Soft serve, chocolate sauce, biscuits and a colourful sprinkle finish. Meet the Fully Loaded Sundae.',
    image: FOOD_IMAGES.floatingSundae,
    dish: 'Fully Loaded Sundae',
  },
] as const;

export default function FeatureSection({
  menuItems = [],
  onOrder,
}: {
  menuItems?: MenuItem[];
  onOrder: () => void;
}) {
  const [active, setActive] = useState(0);
  const [showSpecials, setShowSpecials] = useState(false);
  const [verticalTabs, setVerticalTabs] = useState(true);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useMotionPreference();
  const flavour = FLAVOURS[active];
  useEffect(() => {
    const desktop = window.matchMedia(
      '(min-width: 761px), (max-height: 550px) and (min-width: 560px)',
    );
    const syncOrientation = () => setVerticalTabs(desktop.matches);
    syncOrientation();
    desktop.addEventListener('change', syncOrientation);
    return () => desktop.removeEventListener('change', syncOrientation);
  }, []);
  const specials = menuItems
    .filter(
      (item) => item.showCase && item.soldOut !== 1 && item.avalible !== 1,
    )
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 3);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
      next = (index + 1) % FLAVOURS.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
      next = (index + FLAVOURS.length - 1) % FLAVOURS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = FLAVOURS.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      id="flavours"
      className={styles.section}
      aria-labelledby="feature-heading"
      data-flavour={flavour.id}
    >
      <div className={styles.explorer}>
        <div className={styles.intro}>
          <h2 id="feature-heading" className={`${styles.heading} b-painted`}>
            FIND YOUR <em className="b-script">flavour</em>
          </h2>
          <p className={styles.hint}>
            Smoky, spicy or sweet? Pick one. Or all three.
          </p>
        </div>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Explore our flavours"
          aria-orientation={verticalTabs ? 'vertical' : 'horizontal'}
        >
          {FLAVOURS.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={'flavour-tab-' + item.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls="flavour-panel"
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => moveTab(event, index)}
              className={
                styles.tab + (active === index ? ' ' + styles.activeTab : '')
              }
            >
              <span className={styles.tabLabel}><span className={styles.tabName}>{item.label}</span><span className={styles.tabDetail}>{item.dish}</span></span>
              <ArrowRight size={34} strokeWidth={2.4} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button type="button" className={`b-pill b-pill--ink ${styles.orderLink}`} onClick={onOrder}>
          Order online <ArrowUpRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div
        className={styles.panel}
        id="flavour-panel"
        role="tabpanel"
        aria-labelledby={'flavour-tab-' + flavour.id}
        tabIndex={0}
      >
        <div className={styles.photoFrame}>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={flavour.id}
              className={styles.photo}
              initial={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 1.03 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Image
                src={flavour.image.src}
                alt={flavour.image.alt}
                fill
                sizes="(max-width: 760px) 100vw, 58vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={`${styles.note} b-panel`} aria-live="polite">
          <h3>{flavour.name}</h3>
          <p>{flavour.note}</p>
        </div>
        {specials.length > 0 && (
          <div className={styles.specials}>
            <button
              type="button"
              className={styles.specialsToggle}
              aria-expanded={showSpecials}
              aria-controls="flavour-specials"
              onClick={() => setShowSpecials(!showSpecials)}
            >
              On the menu right now <Plus size={16} className={showSpecials ? styles.expandedIcon : ''} aria-hidden="true" />
            </button>
            {showSpecials && (
              <ul id="flavour-specials">
                {specials.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    {Number.isFinite(Number(item.price)) && (
                      <span>
                        {new Intl.NumberFormat('en-NZ', {
                          style: 'currency',
                          currency: 'NZD',
                        }).format(Number(item.price))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
