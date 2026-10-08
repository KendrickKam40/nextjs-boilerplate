'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MapPin, Pause, Play } from 'lucide-react';
import type { OpenState } from '@/lib/site-hours';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import OpenChip from './OpenChip';
import styles from './Hero.module.css';

// Each dish holds long enough to read and look, then eases into the next.
const HOLD_MS = 7000;

const SLIDES = [
  {
    id: 'nasi-goreng',
    tone: 'red',
    kicker: 'Indonesian comfort',
    left: 'BIG',
    right: 'FLAVOUR',
    em: 3.14, // widest word's advance at 1em in Big Shoulders Black
    image: FOOD_IMAGES.floatingDish,
  },
  {
    id: 'rendang',
    tone: 'green',
    kicker: 'Slow-cooked, properly spiced',
    left: 'RICH',
    right: 'RENDANG',
    em: 3.39,
    image: FOOD_IMAGES.floatingRendang,
  },
  {
    id: 'milkshake',
    tone: 'gold',
    kicker: 'Save room for',
    left: 'SWEET',
    right: 'SHAKES',
    em: 2.79,
    image: FOOD_IMAGES.floatingMilkshake,
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/** First viewport: a slow dish slideshow between two tall sign-painted words, on red, green and gold fields. */
export default function Hero({
  openNow = null,
  onOrder,
}: {
  openNow?: OpenState | null;
  onOrder: () => void;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // hover or keyboard focus
  const [hidden, setHidden] = useState(false);
  const running = !reduced && !paused && !held && !hidden;
  const slide = SLIDES[index];
  const next = SLIDES[(index + 1) % SLIDES.length];

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [running, index]);

  const swap = { duration: reduced ? 0 : 1.2, ease: EASE };

  return (
    <section
      className={styles.hero}
      data-tone={slide.tone}
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setHeld(false);
      }}
    >
      <h1 id="hero-title" className="b-sr-only">
        Balibu: big flavour, Bali soul. Indonesian food, drinks and desserts at Esk Eats, Invercargill Central.
      </h1>

      {/* The next dish waits, out of focus, at the edge of the frame. */}
      <div className={styles.peek} aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={next.id}
            className={styles.peekInner}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -120 }}
            transition={swap}
          >
            <Image src={next.image.src} alt="" width={next.image.width} height={next.image.height} sizes="30vw" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.stage} aria-live="off" style={{ '--em': slide.em } as CSSProperties}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={`k-${slide.id}`}
            className={styles.kicker}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={swap}
          >
            {slide.kicker}
          </motion.p>
        </AnimatePresence>

        <div className={styles.line}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`l-${slide.id}`}
              className={`${styles.word} ${styles.left}`}
              initial={{ opacity: 0, y: '30%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-20%' }}
              transition={swap}
            >
              {slide.left}
            </motion.span>
          </AnimatePresence>

          <div className={styles.dish}>
            <AnimatePresence initial={false}>
              <motion.div
                key={`d-${slide.id}`}
                className={styles.dishInner}
                initial={reduced ? false : { opacity: 0, x: '55%', rotate: 40, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, rotate: slide.id === 'milkshake' ? -6 : -10, scale: 1 }}
                exit={{ opacity: 0, x: '-55%', rotate: -50, scale: 0.85 }}
                transition={swap}
              >
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="(max-width: 700px) 70vw, 40vw"
                  quality={90}
                  priority={slide.id === 'nasi-goreng'}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`r-${slide.id}`}
              className={`${styles.word} ${styles.right}`}
              initial={{ opacity: 0, y: '30%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-20%' }}
              transition={{ ...swap, delay: reduced ? 0 : 0.08 }}
            >
              {slide.right}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.lead}>
        <p className={styles.copy}>
          Nasi goreng, mie goreng, rendang and bakso. Then a milkshake, because you’ve earned it.
        </p>
        <button type="button" className={`b-pill b-pill--cream ${styles.order}`} onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.side}>
        <div className={styles.dots} role="group" aria-label="Choose a dish">
          {SLIDES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={styles.dot}
              aria-label={`Show ${item.left.toLowerCase()} ${item.right.toLowerCase()}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              <span
                className={styles.fill}
                style={{ animationDuration: `${HOLD_MS}ms`, animationPlayState: running ? 'running' : 'paused' }}
                key={i === index ? `${item.id}-${index}` : item.id}
              />
            </button>
          ))}
          {!reduced && (
            <button
              type="button"
              className={styles.pause}
              aria-label={paused ? 'Play dish slideshow' : 'Pause dish slideshow'}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
          )}
        </div>
        <div className={styles.where}>
          <OpenChip state={openNow} />
          <a href="#contact" className={styles.place}>
            <MapPin size={16} aria-hidden="true" /> Esk Eats, Invercargill
          </a>
        </div>
      </div>
    </section>
  );
}
