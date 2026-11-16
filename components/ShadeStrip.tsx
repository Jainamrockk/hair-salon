import Link from "next/link";
import { CATEGORIES } from "@/lib/content";
import { money } from "@/lib/time";

/** The salon colour-bar: every service family as a shade swatch, like the ring on a stylist's colour chart. */
export default function ShadeStrip({ from }: { from: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {CATEGORIES.map((c, i) => (
        <Link key={c.id} href={`/services#${c.id}`} style={{ background: c.hex, color: c.ink, animationDelay: `${i * 70}ms` }}
          className="group relative h-40 md:h-48 rounded-[18px] p-4 flex flex-col justify-between overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-soft animate-rise">
          <div className="flex justify-between text-[10px] tracking-[0.02em] opacity-80 font-semibold"><span>{c.shade}</span><span>{c.shadeName}</span></div>
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
          <div>
            <p className="font-display text-2xl leading-none">{c.name}</p>
            <p className="text-[11px] mt-2 opacity-80 tracking-wide">{from[c.id] ? `From ${money(from[c.id])}` : ""}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
