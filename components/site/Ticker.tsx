import styles from './Ticker.module.css';

// Only dishes and drinks confirmed on Balibu's published menu.
const WORDS = [
  'Nasi goreng',
  'Mie goreng',
  'Rendang',
  'Bakso',
  'Milkshakes',
  'Smoothies',
  'Slushies',
  'Soft serve',
  'T.29 Esk Eats',
];

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0l2.6 8.2L24 12l-9.4 3.8L12 24l-2.6-8.2L0 12l9.4-3.8z" fill="currentColor" />
    </svg>
  );
}

/** A painted band of what's cooking, scrolling like a cart's banner in the wind. */
export default function Ticker({ tone = 'gold' }: { tone?: 'gold' | 'red' }) {
  const run = (hidden: boolean) => (
    <ul className={styles.run} aria-hidden={hidden || undefined}>
      {WORDS.map((word) => (
        <li key={word}>
          <span>{word}</span>
          <Star />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={styles.ticker} data-tone={tone}>
      <span className="b-sr-only">On the menu: {WORDS.slice(0, -1).join(', ')}.</span>
      <div className={styles.track} aria-hidden="true">
        {run(true)}
        {run(true)}
      </div>
    </div>
  );
}
