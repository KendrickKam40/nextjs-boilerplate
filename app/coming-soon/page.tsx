// app/coming-soon/page.tsx
import type { Metadata } from "next";
import styles from './page.module.css';

// Page-level SEO: keep it out of search results while the gate is up.
export const metadata: Metadata = {
  title: "Coming Soon",
  description: "We're launching something great. Get notified when we go live.",
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
    <main className={styles.wrapper}>
      <section className={styles.card} role="region" aria-labelledby="cs-title">
        <header>
          <h1 id="cs-title" className={styles.title}>Coming Soon</h1>
          <p className={styles.sub}>We’re building something you’ll love. Join the list to get launch updates.</p>
        </header>

        {/* Quickest setup: point action to Formspree (replace with your endpoint) */}
        <form
          className={styles.form}
          action="https://formspree.io/f/YOUR_FORM_ID" // or your own API route below
          method="POST"
        >
          <label htmlFor="email" className={styles.srOnly}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Notify me</button>
        </form>

        <p className="cs-small">
          No spam. Unsubscribe anytime.
        </p>
      </section>
    </main>
  );
}