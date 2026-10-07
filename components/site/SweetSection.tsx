'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { collectionFor, type RestaurantData } from '@/lib/site-content';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import styles from './SweetSection.module.css';

const price = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' });

const TREATS = [
  { name: 'Milkshakes', note: 'Thick, cold and topped high.', image: FOOD_IMAGES.floatingMilkshake, tilt: -7 },
  { name: 'Smoothies', note: 'Blended fruit, properly thick.', image: FOOD_IMAGES.cupSmoothie, tilt: 5 },
  { name: 'Slushies', note: 'Icy, bright, brain freeze optional.', image: FOOD_IMAGES.cupSlushie, tilt: -5 },
  { name: 'Dirty Soda', note: 'Cola, cream and a squeeze of lime. Trust us.', image: FOOD_IMAGES.cupDirtySoda, tilt: 4 },
  {
    name: 'Fully Loaded Sundae',
    note: 'Soft serve, chocolate and crunch. Dessert first is allowed.',
    image: FOOD_IMAGES.floatingSundae,
    tilt: 7,
  },
];

/** Drinks and desserts get their own field: equal billing with the savoury food. */
export default function SweetSection({ data, onOrder }: { data: RestaurantData | null; onOrder: () => void }) {
  const names = new Map((data?.categories ?? []).map((c) => [String(c.id ?? c.name).toLowerCase(), c.name]));
  const live = (data?.menuItems ?? [])
    .filter((item) => item.name?.trim() && item.avalible !== 1 && item.soldOut !== 1)
    .filter((item) => {
      const raw = String(item.category ?? '');
      const kind = collectionFor(names.get(raw.toLowerCase()) ?? raw).kind;
      return kind === 'sweet' || kind === 'drinks';
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 6);

  return (
    <section id="flavours" className={styles.section} aria-labelledby="sweet-heading">
      <div className={styles.head}>
        <h2 id="sweet-heading" className={styles.heading}>
          Save room for something sweet.
        </h2>
        <p className={styles.intro}>
          Milkshakes, smoothies, icy slushies, dirty sodas, soft serve and sundaes. Come for a meal,
          stay for the sweet finish.
        </p>
      </div>
      <ul className={styles.treats}>
        {TREATS.map((treat) => (
          <li key={treat.name} className={styles.treat}>
            <div className={styles.cutout} style={{ rotate: `${treat.tilt}deg` }}>
              <Image
                src={treat.image.src}
                alt={treat.image.alt}
                width={treat.image.width}
                height={treat.image.height}
                sizes="(max-width: 700px) 70vw, 34vw"
              />
            </div>
            <h3 className={styles.name}>{treat.name}</h3>
            <p className={styles.note}>{treat.note}</p>
          </li>
        ))}
      </ul>
      {live.length > 0 && (
        <ul className={styles.live} aria-label="Sweet things on the menu right now">
          {live.map((item) => {
            const amount = Number(item.price);
            return (
              <li key={item.id}>
                <span>{item.name}</span>
                {Number.isFinite(amount) && amount > 0 && <span className={styles.price}>{price.format(amount)}</span>}
              </li>
            );
          })}
        </ul>
      )}
      <div className={styles.foot}>
        <button type="button" className="b-pill b-pill--ink" onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
