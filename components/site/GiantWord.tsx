'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import styles from './GiantWord.module.css';

/** One dish named edge to edge, with the plate passing through the letters as you scroll. */
export default function GiantWord() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-28%', '22%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [-24, 30]);

  return (
    <section ref={ref} className={styles.section} aria-labelledby="giant-heading">
      <h2 id="giant-heading" className={styles.word}>
        <span>NASI</span> <span>GORENG</span>
      </h2>
      <motion.div className={styles.plate} style={reduced ? undefined : { y, rotate }}>
        <Image
          src={FOOD_IMAGES.floatingDish.src}
          alt=""
          width={FOOD_IMAGES.floatingDish.width}
          height={FOOD_IMAGES.floatingDish.height}
          sizes="(max-width: 700px) 70vw, 34vw"
        />
      </motion.div>
      <div className={styles.explain}>
        <h3>Nasi goreng? Let’s get into it.</h3>
        <p>
          Indonesia’s fried rice: wok-tossed, smoky, a little sweet, and finished with a fried egg on
          top. The plate that started it all at our counter.
        </p>
      </div>
    </section>
  );
}
