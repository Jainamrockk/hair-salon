/**
 * A hair-colour swatch exactly like the locks on a salon colour ring: a bundle of wavy strands in the shade,
 * lighter strands catching the light, gathered into a small metal clip at the top with its shade code.
 */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

export default function HairSwatch({ hex, code, id, className = "" }: { hex: string; code: string; id: string; className?: string }) {
  const strands = Array.from({ length: 34 }, (_, i) => {
    const x = 38 + (i / 33) * 44 + Math.sin(i * 2.3) * 1.5;
    const sway = 6 + Math.sin(i * 1.3) * 3;
    const end = 240 + Math.sin(i * 0.9) * 8;
    const tipX = x + Math.sin(i) * 6 - (i / 33 - 0.5) * 18;
    return { d: `M ${x} 34 C ${x - sway} 90, ${x + sway} 150, ${x - sway * 0.6} 200 S ${tipX} ${end - 10}, ${tipX} ${end}`, i };
  });
  return (
    <svg viewBox="0 0 120 260" className={className} role="img" aria-label={`Hair swatch, shade ${code}`}>
      <defs>
        <linearGradient id={`sw-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(hex, -0.25)} />
          <stop offset="0.45" stopColor={hex} />
          <stop offset="1" stopColor={shade(hex, 0.12)} />
        </linearGradient>
        <linearGradient id={`clip-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d7a5c" /><stop offset="0.5" stopColor="#efe2c4" /><stop offset="1" stopColor="#8d7a5c" />
        </linearGradient>
      </defs>
      {/* the lock */}
      <path d="M 36 34 C 30 110, 44 180, 52 248 L 70 252 C 82 190, 90 110, 84 34 Z" fill={`url(#sw-${id})`} opacity="0.9" />
      {strands.map((s) => (
        <path key={s.i} d={s.d} fill="none" strokeLinecap="round"
          stroke={s.i % 4 === 0 ? shade(hex, 0.35) : s.i % 3 === 0 ? shade(hex, -0.3) : shade(hex, 0.08)}
          strokeWidth={s.i % 4 === 0 ? 0.7 : 1.1} opacity={s.i % 4 === 0 ? 0.9 : 0.75} />
      ))}
      {/* sheen */}
      <path d="M 50 50 C 46 100, 56 150, 54 210" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
      {/* the clip and ring */}
      <circle cx="60" cy="10" r="7" fill="none" stroke={`url(#clip-${id})`} strokeWidth="2" />
      <rect x="32" y="16" width="56" height="20" rx="3" fill={`url(#clip-${id})`} />
      <text x="60" y="30.5" textAnchor="middle" fontSize="10" fontFamily="Jost, sans-serif" fill="#2a2018" letterSpacing="1">{code}</text>
    </svg>
  );
}
