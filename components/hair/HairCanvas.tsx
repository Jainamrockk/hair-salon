"use client";
import { useEffect, useRef } from "react";

/**
 * A curtain of hair that hangs from the top of the section, sways as if in a hairdryer's breeze, and parts
 * around the pointer like fingers running through it. Pure 2D canvas, ~140 strands, paused when off-screen.
 */
export default function HairCanvas({ className = "", palette = ["#3a2418", "#6b4630", "#9a6a3a", "#c8994f", "#e8cf9c"], density = 140 }: { className?: string; palette?: string[]; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, visible = true;
    const mouse = { x: -9999, y: -9999, vx: 0 };
    type Strand = { x: number; len: number; w: number; col: string; phase: number; curl: number; off: number };
    let strands: Strand[] = [];
    const build = () => {
      const r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      c.width = W * devicePixelRatio; c.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const n = Math.round(density * Math.min(1, W / 1400));
      strands = Array.from({ length: n }, (_, i) => {
        const t = i / n;
        // fuller on the right, like a fall of hair framing the arches
        const x = W * (0.35 + 0.7 * Math.pow(t, 0.8)) + (Math.random() - 0.5) * 30;
        return { x, len: H * (0.45 + Math.random() * 0.5), w: 0.4 + Math.random() * 1.1, col: palette[Math.floor(Math.random() * palette.length)], phase: Math.random() * Math.PI * 2, curl: 18 + Math.random() * 30, off: 0 };
      });
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const t = time / 1000;
      ctx.lineCap = "round";
      for (const s of strands) {
        const segs = 14;
        let px = s.x, py = -10;
        ctx.beginPath();
        ctx.moveTo(px, py);
        for (let k = 1; k <= segs; k++) {
          const f = k / segs;
          const y = -10 + f * s.len;
          let x = s.x + Math.sin(t * 0.9 + s.phase + f * 3) * s.curl * f + Math.sin(t * 0.4 + f * 2) * 14 * f;
          // part around the pointer
          const dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy, R = 120;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1; const push = (1 - d / R) * 70 * f; x += (dx / d) * push + mouse.vx * 0.4 * f; }
          const cx = (px + x) / 2, cy = (py + y) / 2;
          ctx.quadraticCurveTo(px, py, cx, cy);
          px = x; py = y;
        }
        const g = ctx.createLinearGradient(0, 0, 0, s.len);
        g.addColorStop(0, s.col + "00"); g.addColorStop(0.25, s.col + "aa"); g.addColorStop(0.85, s.col + "66"); g.addColorStop(1, s.col + "00");
        ctx.strokeStyle = g;
        ctx.lineWidth = s.w;
        ctx.stroke();
      }
      mouse.vx *= 0.9;
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => { const r = c.getBoundingClientRect(); const x = e.clientX - r.left; mouse.vx = x - mouse.x; mouse.x = x; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(draw); });
    build(); io.observe(c);
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", build); window.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  }, [density, palette]);
  return <canvas ref={ref} className={`pointer-events-none ${className}`} aria-hidden />;
}
