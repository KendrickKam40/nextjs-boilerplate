'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_STORY, type RestaurantClient } from '@/lib/site-content';
import { FOOD_IMAGES } from '@/lib/site-imagery';
import styles from './StorySection.module.css';

export default function StorySection({ client, onOrder }: {
  client?: RestaurantClient;
  onOrder: () => void;
}) {
  return (
    <section id="about" className={styles.section} aria-labelledby="story-heading">
      <h2 id="story-heading" className={`${styles.heading} b-painted`}>
        INDONESIAN ROOTS. <em className="b-script b-script--outlined">Esk Street heart.</em>
      </h2>
      <div className={styles.body}>
        <p className={styles.copy}>{client?.aboutUs?.trim() || BRAND_STORY}</p>
        <p className={`${styles.note} b-script`}>Stay for a meal. Stop for a treat.</p>
        <button type="button" className={`b-pill b-pill--gold ${styles.orderLink}`} onClick={onOrder}>
          Order online <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      {/* Sweets get equal billing: both cups, full size, spilling into the next field. */}
      <div className={`${styles.cup} ${styles.shake}`}>
        <Image
          src={FOOD_IMAGES.floatingMilkshake.src}
          alt={FOOD_IMAGES.floatingMilkshake.alt}
          width={FOOD_IMAGES.floatingMilkshake.width}
          height={FOOD_IMAGES.floatingMilkshake.height}
          sizes="(max-width: 700px) 48vw, 30vw"
        />
      </div>
      <div className={`${styles.cup} ${styles.sundae}`}>
        <Image
          src={FOOD_IMAGES.floatingSundae.src}
          alt={FOOD_IMAGES.floatingSundae.alt}
          width={FOOD_IMAGES.floatingSundae.width}
          height={FOOD_IMAGES.floatingSundae.height}
          sizes="(max-width: 700px) 48vw, 30vw"
        />
      </div>
    </section>
  );
}
