import Image from 'next/image';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import styles from './SignboardHero.module.css';

const SHAKE = FOOD_IMAGES.floatingMilkshake;
const PLATE = FOOD_IMAGES.floatingDish;
const SODA = FOOD_IMAGES.cupDirtySoda;

/** First viewport: a painted sign over terracotta, with nasi goreng between a milkshake and a dirty soda straddling the seam into cream. */
export default function SignboardHero({ onOrder }: { onOrder: () => void }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.field}>
        <h1 id="hero-title" className={`b-signboard ${styles.title}`}>
          Big flavour. Bali soul.
        </h1>
        <p className={styles.sub}>Indonesian street food at Esk Eats, Invercargill.</p>
        <div className={styles.actions}>
          <button type="button" className={`b-pill b-pill--gold ${styles.order}`} onClick={onOrder}>
            Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <a href="#menu" className={`b-pill b-pill--line ${styles.browse}`}>
            See what’s cooking <ArrowDown size={18} strokeWidth={2.4} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className={styles.trio}>
        <Image
          className={`${styles.cup} ${styles.shake}`}
          src={SHAKE.src}
          alt="A pink milkshake in a Balibu takeaway cup"
          width={SHAKE.width}
          height={SHAKE.height}
          sizes="230px"
          draggable={false}
        />
        <div className={styles.plate}>
          <Image
            src={PLATE.src}
            alt={PLATE.alt}
            fill
            sizes="(max-width: 700px) 82vw, 540px"
            quality={90}
            priority
            draggable={false}
          />
          <span className={styles.tag} aria-hidden="true">
            Nasi goreng
          </span>
        </div>
        <Image
          className={`${styles.cup} ${styles.soda}`}
          src={SODA.src}
          alt="A dirty soda with cola, cream and lime in a Balibu takeaway cup"
          width={SODA.width}
          height={SODA.height}
          sizes="230px"
          draggable={false}
        />
      </div>

      <div className={styles.stripe} aria-hidden="true" />
    </section>
  );
}
