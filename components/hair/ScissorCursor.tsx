"use client";
import { useEffect, useRef } from "react";

const svg = (open: boolean) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><g fill='none' stroke='%23d6bd92' stroke-width='1.6' stroke-linecap='round'>${
    open ? "<path d='M4 4 L18 16 M4 20 L18 9' stroke='#d6bd92'/>" : "<path d='M4 6 L19 13 M4 18 L19 11' stroke='#d6bd92'/>"
  }<circle cx='23' cy='9' r='4' stroke='#d6bd92'/><circle cx='23' cy='19' r='4' stroke='#d6bd92'/></g><circle cx='3' cy='12' r='1.6' fill='#f0e6d6'/></svg>`).replace(/%2523/g, "%23")}") 3 12`;

/**
 * Desktop only: the pointer becomes a pair of salon shears; every click snips and drops a few hair clippings
 * that tumble and fade. Inputs keep their normal text cursor. Off for touch and reduced motion.
 */
export default function ScissorCursor() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    const style = document.createElement("style");
    style.textContent = `body{cursor:${svg(true)},auto} a,button,[role=button],label,select{cursor:${svg(false)},pointer} input,textarea,[contenteditable]{cursor:text}`;
    document.head.appendChild(style);

    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    type Bit = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; len: number; life: number; col: string };
    const bits: Bit[] = [];
    let raf = 0;
    const cols = ["#3a2418", "#6b4630", "#9a6a3a", "#c8994f", "#1b1714"];
    const size = () => { c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.vy += 0.12; b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.life -= 0.012;
        if (b.life <= 0) { bits.splice(i, 1); continue; }
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.strokeStyle = b.col; ctx.globalAlpha = Math.min(1, b.life * 1.4); ctx.lineWidth = 1.1; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-b.len / 2, 0); ctx.quadraticCurveTo(0, -b.len * 0.25, b.len / 2, 0); ctx.stroke();
        ctx.restore();
      }
      raf = bits.length ? requestAnimationFrame(tick) : 0;
    };
    const snip = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select,canvas,iframe")) return;
      for (let i = 0; i < 9; i++) bits.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, len: 8 + Math.random() * 14, life: 1, col: cols[i % cols.length] });
      if (!raf) raf = requestAnimationFrame(tick);
    };
    size();
    addEventListener("resize", size);
    addEventListener("pointerdown", snip, { passive: true });
    return () => { style.remove(); cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("pointerdown", snip); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[90] h-full w-full" aria-hidden />;
}
