'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  collectionFor,
  MENU_COLLECTIONS,
  type MenuCollection,
  type MenuItem,
  type RestaurantData,
} from '@/lib/site-content';
import styles from './MenuSection.module.css';

const price = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
});

type Collection = MenuCollection & { items: MenuItem[] };

function sameCategory(item: MenuItem, category: { id?: string | number; name: string }) {
  const value = String(item.category ?? '').trim().toLowerCase();
  return (
    value !== '' &&
    (value === category.name.trim().toLowerCase() ||
      (category.id !== undefined && value === String(category.id).toLowerCase()))
  );
}

function liveCollections(data: RestaurantData | null): Collection[] {
  const items = (data?.menuItems ?? [])
    .filter((item) => item.name?.trim() && item.avalible !== 1)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  let categories = (data?.categories ?? [])
    .filter((category) => category.visible !== false && category.name?.trim())
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  if (!categories.length) {
    categories = [
      ...new Set(items.map((item) => String(item.category ?? '').trim()).filter(Boolean)),
    ].map((name) => ({ name }));
  }
  const seen = new Set<string>();
  return categories.flatMap((category) => {
    if (seen.has(category.name)) return [];
    seen.add(category.name);
    return [
      {
        ...collectionFor(category.name),
        name: category.name,
        items: items.filter((item) => sameCategory(item, category)),
      },
    ];
  });
}

export default function MenuSection({
  data,
  onOrder,
}: {
  data: RestaurantData | null;
  onOrder: () => void;
}) {
  const [selected, setSelected] = useState('');
  const reduceMotion = useReducedMotion();
  const collections = useMemo<Collection[]>(() => {
    const live = liveCollections(data);
    return live.length
      ? live
      : MENU_COLLECTIONS.map((collection) => ({ ...collection, items: [] }));
  }, [data]);
  const hasLiveItems = collections.some((collection) => collection.items.length);
  const active =
    collections.find((collection) => collection.name === selected) ??
    collections[0];

  return (
    <section
      id="menu"
      className={styles.section}
      aria-labelledby="menu-heading"
    >
      <div className={styles.headingRow}>
        <h2 id="menu-heading" className={`${styles.heading} b-painted`}>
          THE MENU
          <em className="b-script">follow your cravings</em>
        </h2>
        <p className={styles.intro}>
          {hasLiveItems
            ? 'Straight from today’s counter. Pick a section to see what’s on.'
            : 'Rice, noodles, something from the grill and a sweet finish. Pick a section for a taste.'}
        </p>
      </div>

      {active ? (
        <div className={styles.counter}>
          <div
            className={styles.collectionList}
            role="group"
            aria-label="Menu sections"
          >
            {collections.map((collection) => (
              <button
                key={collection.name}
                type="button"
                className={`${styles.collection} ${active.name === collection.name ? styles.activeCollection : ''}`}
                onClick={() => setSelected(collection.name)}
                aria-pressed={active.name === collection.name}
                aria-controls="menu-collection-preview"
              >
                <span className={styles.collectionName}>
                  {collection.name}
                </span>
                {collection.items.length > 0 && (
                  <span className={styles.collectionCount}>
                    {collection.items.length}
                  </span>
                )}
                <ArrowRight size={28} strokeWidth={2.4} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className={styles.stage} data-kind={active.kind}>
            <div className={styles.imageArea}>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={active.name}
                  className={styles.photo}
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Image
                    src={active.image}
                    alt={active.imageAlt}
                    fill
                    sizes="(max-width: 700px) 90vw, 58vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className={`${styles.ticket} b-panel`} id="menu-collection-preview">
              <div className={styles.ticketHead}>
                <div aria-live="polite" aria-atomic="true">
                  <h3>{active.name}</h3>
                  {!active.items.length && (
                    <p className={styles.description}>{active.description}</p>
                  )}
                </div>
                <button className={`b-pill b-pill--ink ${styles.order}`} type="button" onClick={onOrder}>
                  Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
              {active.items.length > 0 && (
                <ul className={styles.items} aria-label={`${active.name} today`}>
                  {active.items.map((item) => {
                    const amount = Number(item.price);
                    const soldOut = item.soldOut === 1;
                    return (
                      <li key={item.id} data-sold-out={soldOut}>
                        <span className={styles.itemName}>
                          {item.name}
                          {item.description?.trim() && (
                            <small>{item.description}</small>
                          )}
                        </span>
                        <span className={styles.itemPrice}>
                          {soldOut
                            ? 'Sold out'
                            : Number.isFinite(amount) && amount > 0
                              ? price.format(amount)
                              : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty} role="status">
          <p>The menu is having a quick nap. The full list is on our ordering page.</p>
          <button className="b-pill b-pill--gold" type="button" onClick={onOrder}>
            Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      )}
      <p className={styles.footer}>
        {hasLiveItems
          ? 'Prices and availability can change through the day.'
          : 'Today’s dishes, prices & availability are on our ordering menu.'}
      </p>
    </section>
  );
}
