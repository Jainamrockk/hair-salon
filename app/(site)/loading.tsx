/** Shown while a page's data loads: a comb drawing through three swaying strands. */
export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center" role="status" aria-label="Loading">
      <svg viewBox="0 0 120 80" className="h-24 w-36">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${40 + i * 20},6 C${30 + i * 20},30 ${50 + i * 20},50 ${40 + i * 20},74`} fill="none" stroke="rgb(var(--c-gold))" strokeWidth="1.6" strokeLinecap="round"
            style={{ animation: `float ${1.4 + i * 0.2}s ${i * 0.15}s ease-in-out infinite` }} />
        ))}
        <g style={{ animation: "comb 1.6s cubic-bezier(.65,0,.35,1) infinite" }}>
          <rect x="10" y="30" width="100" height="6" rx="3" fill="rgb(var(--c-ink))" opacity="0.85" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={14 + i * 6} y="36" width="2" height="9" rx="1" fill="rgb(var(--c-ink))" opacity="0.85" />)}
        </g>
      </svg>
      <style>{`@keyframes comb{0%{transform:translateY(-18px)}50%{transform:translateY(22px)}100%{transform:translateY(-18px)}}`}</style>
    </div>
  );
}
