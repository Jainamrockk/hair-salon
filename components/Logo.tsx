/** Monogram: an arched mirror niche with a pair of shears crossing inside it. */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M8 37 V17 a12 12 0 0 1 24 0 V37" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M14 14 L26 30 M26 14 L14 30" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="13" cy="31.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="27" cy="31.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="20" cy="22" r="0.9" fill="currentColor" />
    </svg>
  );
}

/** Wordmark in Italiana, widely tracked like lettering on a salon window. `light` keeps the old API. */
export default function Logo({ className = "", light: _light }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Monogram className="h-[1.15em] w-[1.15em] text-gold-deep" />
      <span className="font-display text-[0.8em] tracking-[0.42em] uppercase leading-none whitespace-nowrap">Salon Ché</span>
    </span>
  );
}
