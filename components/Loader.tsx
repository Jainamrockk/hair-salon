"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Monogram } from "./Logo";

/** Cinematic opening: shears open and close in the dark while light sweeps a fan of shade swatches, then the curtain lifts. Once per session. */
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
      const t = Math.min(1, (performance.now() - started) / 2000);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
      else { setVisible(false); document.documentElement.style.overflow = ""; try { sessionStorage.setItem("che:entered", "1"); } catch {} }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.documentElement.style.overflow = ""; };
  }, []);
  const shades = ["#1b1714", "#3a2a20", "#6b4630", "#8f1d2c", "#b0592b", "#c8994f", "#b9b0a0", "#e8e1d2"];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory" exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }} aria-hidden>
          <div className="relative h-44 w-44">
            {shades.map((c, i) => (
              <motion.span key={c} className="absolute left-1/2 bottom-6 h-28 w-5 origin-bottom rounded-t-full" style={{ background: c, marginLeft: -10, boxShadow: "0 0 30px rgb(0 0 0 / .4)" }}
                initial={{ rotate: 0, opacity: 0 }} animate={{ rotate: -56 + i * 16, opacity: 1 }} transition={{ delay: 0.15 + i * 0.07, duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
            ))}
            <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, duration: 1 }}>
              <Monogram className="h-16 w-16 text-gold-light translate-y-8" />
            </motion.div>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="absolute h-1 w-1 rounded-full bg-gold-light" style={{ left: `${50 + Math.cos(i * 1.7) * 52}%`, top: `${45 + Math.sin(i * 1.3) * 52}%`, animation: `twinkle ${1.8 + (i % 3) * 0.6}s ${i * 0.2}s infinite ease-in-out`, boxShadow: "0 0 8px 2px rgba(243,227,189,0.6)" }} />
            ))}
          </div>
          <motion.p className="mt-12 font-display text-xl uppercase text-noir" initial={{ opacity: 0, letterSpacing: "0.9em" }} animate={{ opacity: 1, letterSpacing: "0.5em" }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}>Salon Ché</motion.p>
          <motion.p className="mt-3 text-sm tracking-[0.12em] text-noir/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1.4 }}>Hair · Color · Barber — Nampa</motion.p>
          <div className="mt-10 h-px w-48 overflow-hidden bg-noir/10"><div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
