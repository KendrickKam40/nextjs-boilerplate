{/* ─── SCROLLING BANNER (SEAMLESS) ───────────────────────────────────── */}
export default function Ticker() {
  const items = [
    'Savour IndoFusion Bowls',
    'Order Online Now',
    'Earn Rewards',
    'Seasonal Specials',
  ];
  // Duplicate items so each half of the track is comfortably wider than the viewport
  const looped = Array(4).fill(items).flat();

  return (
    <div className="relative overflow-hidden border-y border-[#EAE0DA] bg-white py-2">
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
          animation: ticker 18s linear infinite;
          will-change: transform;
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
          letter-spacing: 0.2em;
          font-weight: 700;
          line-height: 1;             /* avoid vertical overlap */
          color: #d6112c;
        }

        @keyframes ticker {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); } /* slide by exactly one group width */
        }

        /* On hover, PAUSE (don’t change the speed mid-cycle, which causes a jump) */
        @media (hover:hover) {
          .ticker-track:hover { animation-play-state: paused; }
        }
      `}</style>
    </div>
  );
};