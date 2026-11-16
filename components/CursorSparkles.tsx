"use client";

import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
}

/** Fine sparks follow the cursor across the hero only — fewer and slower than you think, so it reads as light, not confetti. */
export function CursorSparkles() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    const ctx = el.getContext("2d")!;
    const sparks: Spark[] = [];
    let raf = 0;
    let lastSpawn = 0;
    const resize = () => {
      el.width = el.offsetWidth * devicePixelRatio;
      el.height = el.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    const move = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 60) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      lastSpawn = now;
      sparks.push({ x, y, vx: (Math.random() - 0.5) * 0.4, vy: Math.random() * 0.5 + 0.1, life: 1, size: Math.random() * 2.2 + 0.8, hue: Math.random() < 0.7 ? 38 : 20 });
      if (sparks.length > 24) sparks.shift();
    };
    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.016;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        const r = s.size * s.life;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.life * 2);
        ctx.fillStyle = `hsla(${s.hue}, 30%, 94%, ${s.life * 0.8})`;
        ctx.shadowColor = `hsla(${s.hue}, 80%, 80%, ${s.life})`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -r * 2.4);
        ctx.lineTo(r * 0.4, -r * 0.4);
        ctx.lineTo(r * 2.4, 0);
        ctx.lineTo(r * 0.4, r * 0.4);
        ctx.lineTo(0, r * 2.4);
        ctx.lineTo(-r * 0.4, r * 0.4);
        ctx.lineTo(-r * 2.4, 0);
        ctx.lineTo(-r * 0.4, -r * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={canvas} className="fx pointer-events-none absolute inset-0 z-[5] h-full w-full" aria-hidden />;
}
