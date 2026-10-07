'use client';

import Image from 'next/image';
import { useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
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

const TONES = ['red', 'gold', 'cream'] as const;
const LIVE_PREVIEW = 4;

export default function MenuSection({
  data,
  onOrder,
}: {
  data: RestaurantData | null;
  onOrder: () => void;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const collections = useMemo<Collection[]>(() => {
    const live = liveCollections(data);
    return live.length ? live : MENU_COLLECTIONS.map((collection) => ({ ...collection, items: [] }));
  }, [data]);
  const hasLiveItems = collections.some((collection) => collection.items.length);

  const scrollBy = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 20 : row.clientWidth * 0.8;
    row.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <section id="menu" className={styles.section} aria-labelledby="menu-heading">
      <div className={styles.head}>
        <h2 id="menu-heading" className={styles.heading}>
          Follow your cravings.
        </h2>
        <p className={styles.intro}>
          {hasLiveItems
            ? 'Straight from today’s counter, with today’s prices. Scroll through and pick a favourite.'
            : 'Rice, noodles, something from the grill, and a sweet finish. Scroll through and pick a favourite.'}
        </p>
      </div>

      <div className={styles.rail}>
        <ul ref={rowRef} className={styles.row} aria-label="Menu sections">
          {collections.map((collection, index) => {
            const tone = TONES[index % TONES.length];
            const shown = collection.items.slice(0, LIVE_PREVIEW);
            const more = collection.items.length - shown.length;
            return (
              <li key={collection.name} className={styles.card} data-tone={tone}>
                <div className={styles.food}>
                  <Image
                    src={collection.image}
                    alt={collection.imageAlt}
                    width={1254}
                    height={1254}
                    sizes="(max-width: 700px) 70vw, 340px"
                  />
                </div>
                <h3 className={styles.name}>{collection.name}</h3>
                {shown.length ? (
                  <ul className={styles.items}>
                    {shown.map((item) => {
                      const amount = Number(item.price);
                      const soldOut = item.soldOut === 1;
                      return (
                        <li key={item.id} data-sold-out={soldOut}>
                          <span>{item.name}</span>
                          <span className={styles.price}>
                            {soldOut ? 'Sold out' : Number.isFinite(amount) && amount > 0 ? price.format(amount) : ''}
                          </span>
                        </li>
                      );
                    })}
                    {more > 0 && <li className={styles.more}>+ {more} more on the ordering menu</li>}
                  </ul>
                ) : (
                  <p className={styles.description}>{collection.description}</p>
                )}
              </li>
            );
          })}
        </ul>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => scrollBy(-1)} aria-label="Previous menu sections">
            <ArrowLeft size={22} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <button type="button" className={styles.arrow} onClick={() => scrollBy(1)} aria-label="More menu sections">
            <ArrowRight size={22} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.foot}>
        <button type="button" className="b-pill b-pill--gold" onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
        <p className={styles.note}>
          {hasLiveItems
            ? 'Prices and availability can change through the day.'
            : 'Today’s dishes, prices & availability are on our ordering menu.'}
        </p>
      </div>
    </section>
  );
}
