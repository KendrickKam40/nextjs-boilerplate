'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { OpenState } from '@/lib/site-hours';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import OpenChip from './OpenChip';
import styles from './Hero.module.css';

/** One word across the field, the plate set into it: the letters run behind the dish. */
export default function Hero({
  openNow = null,
  onOrder,
}: {
  openNow?: OpenState | null;
  onOrder: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // The plate turns as the visitor scrolls, the way a cart's dish is turned to show you.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const turn = useTransform(scrollYProgress, [0, 1], [-8, 40]);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <span className={styles.disc} aria-hidden="true" />

      <h1 id="hero-title" className={styles.title}>
        <span className={`${styles.big} b-painted`}>BIG</span>
        <span className={`${styles.word} b-painted`}>FLAVOUR.</span>
        <em className={`${styles.soul} b-script b-script--outlined`}>Bali soul.</em>
      </h1>

      <motion.div className={styles.plate} style={reduced ? { rotate: -8 } : { rotate: turn }}>
        <motion.div
          className={styles.plateInner}
          initial={reduced ? false : { scale: 0.82, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <Image
            src={FOOD_IMAGES.floatingDish.src}
            alt={FOOD_IMAGES.floatingDish.alt}
            width={FOOD_IMAGES.floatingDish.width}
            height={FOOD_IMAGES.floatingDish.height}
            sizes="(max-width: 700px) 80vw, 40vw"
            quality={90}
            priority
            draggable={false}
          />
        </motion.div>
      </motion.div>

      <div className={styles.lead}>
        <p className={styles.line}>
          Nasi goreng, mie goreng, rendang and bakso. Then a milkshake, because you’ve earned it.
        </p>
        <button type="button" className={`b-pill b-pill--cream ${styles.order}`} onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.where}>
        <OpenChip state={openNow} />
        <a href="#contact" className={styles.place}>
          <MapPin size={16} aria-hidden="true" /> T.29, Esk Eats
        </a>
      </div>
    </section>
  );
}
