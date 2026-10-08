'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_STORY, type RestaurantClient } from '@/lib/site-content';
import styles from './StorySection.module.css';

/** The Balibu story beside a photo of the counter, with an order button. */
export default function StorySection({ client, onOrder }: {
  client?: RestaurantClient;
  onOrder: () => void;
}) {
  return (
    <section id="about" className={styles.section} aria-labelledby="story-heading">
      <div className={styles.story}>
        <h2 id="story-heading" className={styles.heading}>
          <span className={styles.lineBreak}>Indonesian roots.</span>{' '}
          <span className={styles.lineBreak}>Esk Street heart.</span>
        </h2>
        <p className={styles.copy}>{client?.aboutUs?.trim() || BRAND_STORY}</p>
        <button type="button" className={`b-pill b-pill--ink ${styles.orderLink}`} onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      <figure className={styles.photo}>
        <div className={styles.frame}>
          <Image
            src="/images/store/balibu-counter.jpg"
            alt="Balibu’s counter at Esk Eats, with its red back wall, overhead menus and original round Balibu signs"
            fill
            sizes="(max-width: 900px) 92vw, 46vw"
          />
          <span className={styles.sticker}>Look for the red wall.</span>
        </div>
        <figcaption>
          <a href="https://maps.google.com/maps/contrib/116009927405077998924" target="_blank" rel="noopener noreferrer">
            Photo: Pang / Google Maps <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
