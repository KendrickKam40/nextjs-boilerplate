import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { Dish } from '@/lib/site-content';
import styles from './DishSection.module.css';

/** A painted-sign heading over a grid of dish tiles. Each whole tile opens online ordering. */
export default function DishSection({
  id,
  title,
  intro,
  dishes,
  tone,
  onOrder,
}: {
  id: string;
  title: string;
  intro: string;
  dishes: Dish[];
  /** savoury: terracotta field, ink sign. sweet: turmeric field, terracotta sign. */
  tone: 'savoury' | 'sweet';
  onOrder: () => void;
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} className={styles.section} data-tone={tone} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={`b-signboard ${styles.title}`} data-tone={tone === 'sweet' ? 'accent' : undefined}>
          {title}
        </h2>
        <p className={styles.intro}>{intro}</p>
      </div>
      <ul className={styles.grid}>
        {dishes.map((dish) => (
          <li key={dish.name} className={dish.wide ? styles.wide : undefined}>
            <button
              type="button"
              className={styles.tile}
              onClick={onOrder}
              aria-label={`Order ${dish.name.toLowerCase()} online`}
            >
              <span className={styles.photo}>
                <Image
                  src={dish.image.src}
                  alt=""
                  width={dish.image.width}
                  height={dish.image.height}
                  sizes="(max-width: 700px) 45vw, 260px"
                  draggable={false}
                  style={{ rotate: `${dish.tilt}deg` }}
                />
              </span>
              <span className={styles.name}>{dish.name}</span>
              <span className={styles.line}>{dish.line}</span>
              <span className={styles.go} aria-hidden="true">
                <ArrowUpRight size={18} strokeWidth={2.4} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
