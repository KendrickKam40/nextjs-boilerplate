import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import '@/components/site/site.css';
import styles from './page.module.css';
import BrandLogo from '@/components/site/BrandLogo';
import { FOOD_IMAGES } from '@/lib/site-imagery';

// Page-level SEO: keep it out of search results while the gate is up.
export const metadata: Metadata = {
  title: 'Coming soon · Balibu',
  description:
    'A fresh look for Balibu is on its way. Explore our menu and order online in the meantime.',
  robots: {
    index: false,
    follow: false,
    // optional extra directives (GoogleBot understands these too)
    nocache: true,
    noarchive: true,
  },
};

export default function ComingSoonPage() {
  return (
    <main className={`balibu-site ${styles.wrapper}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Balibu home">
          <BrandLogo
            className={styles.logo}
            sizes="(max-width: 760px) 88px, 104px"
            priority
          />
        </Link>
        <span className={styles.label}>A fresh chapter</span>
      </header>

      <section className={styles.content} aria-labelledby="cs-title">
        <div className={styles.copy}>
          <h1 id="cs-title" className={styles.title}>
            NEW LOOK.
            <br />
            <em>Same soul.</em>
          </h1>
          <p className={styles.description}>
            Our new website is on its way. Until then, your next taste of Balibu
            is just a few clicks away.
          </p>
          <a
            className={styles.button}
            href="https://ordering.balibu.co.nz"
            target="_blank"
            rel="noopener noreferrer"
          >
            Order online
            <ArrowUpRight size={21} aria-hidden="true" />
          </a>
          <p className={styles.note}>Opens our online ordering site.</p>
        </div>
        <div className={styles.picture}>
          <Image
            src={FOOD_IMAGES.satay.src}
            alt={FOOD_IMAGES.satay.alt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
            className={styles.image}
          />
          <span className={styles.photoLabel}>Good food. Good company.</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Balinese roots. Big flavour.</span>
        <Link href="/">
          Back to Balibu <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}
