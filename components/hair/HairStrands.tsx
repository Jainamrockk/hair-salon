"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Long flowing strands of gilt hair drawn across a section, like a lock caught in warm light. Decorative only. */
export default function HairStrands({ className = "", count = 22, color = "rgb(var(--c-gold))" }: { className?: string; count?: number; color?: string }) {
  const reduce = useReducedMotion();
  const paths = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const y0 = 120 + t * 260, amp = 60 + Math.sin(i * 1.7) * 30, lift = (t - 0.5) * 80;
    return `M -40 ${y0} C 240 ${y0 - amp - lift}, 420 ${y0 + amp}, 720 ${y0 - lift * 0.4} S 1180 ${y0 - amp * 0.8}, 1480 ${y0 + 40 - lift}`;
  });
  return (
    <svg viewBox="0 0 1440 640" preserveAspectRatio="none" className={`pointer-events-none ${className}`} aria-hidden>
      <defs>
        <linearGradient id="strand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.25" stopColor={color} stopOpacity="0.55" />
          <stop offset="0.7" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke="url(#strand)" strokeWidth={i % 5 === 0 ? 1.4 : 0.6} strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3.2, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }} />
      ))}
    </svg>
  );
}
