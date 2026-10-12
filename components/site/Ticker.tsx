import styles from './Ticker.module.css';

// Only dishes and drinks confirmed on Balibu's published menu.
const MENU_WORDS = [
  'Nasi goreng',
  'Mie goreng',
  'Rendang',
  'Bakso',
  'Milkshakes',
  'Smoothies',
  'Slushies',
  'Dirty soda',
  'Soft serve',
];

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0l2.6 8.2L24 12l-9.4 3.8L12 24l-2.6-8.2L0 12l9.4-3.8z" fill="currentColor" />
    </svg>
  );
}

/** A band that rolls across a seam: what's cooking, or whether we're open. */
export default function Ticker({
  tone = 'gold',
  words = MENU_WORDS,
  label,
  tilt = false,
}: {
  tone?: 'gold' | 'red' | 'cream';
  words?: string[];
  label?: string;
  tilt?: boolean;
}) {
  // Repeat short lists so one run is always wider than the screen.
  const run = words.length < 6 ? [...words, ...words, ...words, ...words] : words;
  const list = (
    <ul className={styles.run}>
      {run.map((word, i) => (
        <li key={`${word}-${i}`}>
          <span>{word}</span>
          <Star />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={styles.ticker} data-tone={tone} data-tilt={tilt || undefined}>
      <span className="b-sr-only">{label ?? `On the menu: ${MENU_WORDS.join(', ')}.`}</span>
      <div className={styles.track} aria-hidden="true">
        {list}
        {list}
      </div>
    </div>
  );
}
