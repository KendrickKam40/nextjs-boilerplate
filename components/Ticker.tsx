{/* ─── SCROLLING BANNER (SEAMLESS) ───────────────────────────────────── */}
export default function Ticker({ phrase }: { phrase: string }) {
  const base = (phrase || '').trim();
  const looped = Array(12).fill(base);

  return (
    <div className="relative overflow-hidden border-y border-[#EAE0DA] bg-white py-6">
      <div className="ticker-track">
        {/* Group A */}
        <div className="ticker-group" aria-hidden="false">
          {looped.map((t, i) => (
            <span key={`a-${i}`} className="ticker-item">
              {t} •
            </span>
          ))}
        </div>
        {/* Group B (duplicate) */}
        <div className="ticker-group" aria-hidden="true">
          {looped.map((t, i) => (
            <span key={`b-${i}`} className="ticker-item">
              {t} •
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          display: flex;
          width: max-content;         /* size to content (two groups) */
          -webkit-animation: ticker 120s linear infinite;
          animation: ticker 120s linear infinite;
          will-change: transform;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .ticker-group {
          display: flex;
          align-items: center;
          white-space: nowrap;
          flex: 0 0 auto;             /* prevent squashing; no fixed width */
          gap: 2rem;
          padding-right: 2rem;
        }

        .ticker-item {
          text-transform: uppercase;
          font-weight: 700;
          line-height: 1;             /* avoid vertical overlap */
          color: #d6112c;
          font-size: 1.6em;
          font-family: var(--font-serif);
          -webkit-font-smoothing: antialiased;
        }

        @-webkit-keyframes ticker {
          0%   { -webkit-transform: translateX(0%); transform: translateX(0%); }
          100% { -webkit-transform: translateX(-50%); transform: translateX(-50%); }
        }

        @keyframes ticker {
          0%   { -webkit-transform: translateX(0%); transform: translateX(0%); }
          100% { -webkit-transform: translateX(-50%); transform: translateX(-50%); }
        }

        /* On hover, PAUSE */
        @media (hover:hover) {
          .ticker-track:hover { -webkit-animation-play-state: paused; animation-play-state: paused; }
        }
      `}</style>
    </div>
  );
};