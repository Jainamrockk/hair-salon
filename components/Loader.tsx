"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Opening scene, once per visit: a glossy lock of hair falls into the light, salon shears close on it with a
 * snip, the trimmed ends tumble away, and the name settles in gold. Then the curtain lifts.
 */
export default function Loader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("che:entered") === "1"; } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.webdriver) return;
    setVisible(true);
    document.documentElement.style.overflow = "hidden";
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - started) / 2900);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
      else { setVisible(false); document.documentElement.style.overflow = ""; try { sessionStorage.setItem("che:entered", "1"); } catch {} }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.documentElement.style.overflow = ""; };
  }, []);

  const strands = Array.from({ length: 26 }, (_, i) => {
    const x = 84 + i * 1.25;
    const sway = 5 + (i % 5);
    return `M${x},10 C${x - sway},60 ${x + sway},110 ${x - sway / 2},150`;
  });
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory" exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }} aria-hidden>
          <div className="absolute inset-0 pin-spot" />
          <svg viewBox="0 0 200 260" className="relative h-[46vh] max-h-[400px] w-auto overflow-visible">
            <defs>
              <linearGradient id="ld-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2418" /><stop offset="0.5" stopColor="#9a6a3a" /><stop offset="1" stopColor="#e8cf9c" /></linearGradient>
              <linearGradient id="ld-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3ead9" /><stop offset="0.5" stopColor="#b39762" /><stop offset="1" stopColor="#6e5a3c" /></linearGradient>
              <clipPath id="ld-top"><rect x="0" y="0" width="200" height="118" /></clipPath>
              <clipPath id="ld-bottom"><rect x="0" y="118" width="200" height="200" /></clipPath>
            </defs>
            {/* the lock: upper part stays, lower part is cut and falls */}
            <motion.g initial={{ y: -180, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: EASE }}>
              <g clipPath="url(#ld-top)">{strands.map((d, i) => <path key={i} d={d} fill="none" stroke="url(#ld-hair)" strokeWidth={i % 4 ? 1.6 : 0.8} strokeLinecap="round" />)}</g>
              <motion.g clipPath="url(#ld-bottom)" initial={{ y: 0, rotate: 0, opacity: 1 }} animate={{ y: 160, rotate: 18, opacity: 0 }} transition={{ delay: 1.45, duration: 1.1, ease: [0.5, 0, 0.75, 0] }} style={{ transformOrigin: "100px 130px" }}>
                {strands.map((d, i) => <path key={i} d={d} fill="none" stroke="url(#ld-hair)" strokeWidth={i % 4 ? 1.6 : 0.8} strokeLinecap="round" />)}
              </motion.g>
            </motion.g>
            {/* the shears close across the lock */}
            <motion.g initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.7, ease: EASE }}>
              <motion.g style={{ transformOrigin: "100px 118px" }} initial={{ rotate: -16 }} animate={{ rotate: [-16, -16, 0] }} transition={{ delay: 1.1, duration: 0.45, times: [0, 0.4, 1] }}>
                <path d="M100,118 L40,112 L38,116 Z" fill="url(#ld-steel)" />
                <circle cx="158" cy="104" r="12" fill="none" stroke="url(#ld-steel)" strokeWidth="4" />
                <path d="M100,118 L148,108" stroke="url(#ld-steel)" strokeWidth="5" strokeLinecap="round" />
              </motion.g>
              <motion.g style={{ transformOrigin: "100px 118px" }} initial={{ rotate: 16 }} animate={{ rotate: [16, 16, 0] }} transition={{ delay: 1.1, duration: 0.45, times: [0, 0.4, 1] }}>
                <path d="M100,118 L40,124 L38,120 Z" fill="url(#ld-steel)" />
                <circle cx="158" cy="132" r="12" fill="none" stroke="url(#ld-steel)" strokeWidth="4" />
                <path d="M100,118 L148,128" stroke="url(#ld-steel)" strokeWidth="5" strokeLinecap="round" />
              </motion.g>
              <circle cx="100" cy="118" r="3" fill="#f3ead9" />
            </motion.g>
            {/* snip flash */}
            <motion.circle cx="96" cy="118" r="30" fill="#f0dcae" initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: [0, 0.5, 0], scale: [0.2, 1.4, 1.8] }} transition={{ delay: 1.5, duration: 0.6 }} style={{ transformOrigin: "96px 118px" }} />
          </svg>
          <motion.p className="relative mt-6 font-display text-2xl uppercase text-noir" initial={{ opacity: 0, letterSpacing: "0.9em" }} animate={{ opacity: 1, letterSpacing: "0.5em" }} transition={{ delay: 1.6, duration: 1.6, ease: EASE }}>Salon Ché</motion.p>
          <motion.p className="relative mt-3 text-sm tracking-[0.12em] text-noir/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>Let it shine.</motion.p>
          <div className="relative mt-8 h-px w-48 overflow-hidden bg-noir/10"><div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
