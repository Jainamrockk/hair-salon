"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SHADES } from "@/lib/shades";
import { saveLook } from "@/app/actions";

type Area = "all" | "highlights" | "roots";
const SAMPLE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80";
const hex2rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

export default function TryOnStudio() {
  const view = useRef<HTMLCanvasElement>(null);
  const base = useRef<ImageData | null>(null);
  const mask = useRef<Float32Array | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const [loaded, setLoaded] = useState(false);
  const [shade, setShade] = useState(SHADES[5]);
  const [strength, setStrength] = useState(70);
  const [area, setArea] = useState<Area>("all");
  const [tool, setTool] = useState<"pick" | "brush" | "erase">("pick");
  const [brush, setBrush] = useState(28);
  const [split, setSplit] = useState(50);
  const [hasMask, setHasMask] = useState(false);
  const [msg, setMsg] = useState("");
  const painting = useRef(false);

  const load = (src: string, cors = false) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => {
      const max = 900, s = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * s), h = Math.round(img.height * s);
      const c = view.current!; c.width = w; c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      base.current = ctx.getImageData(0, 0, w, h);
      mask.current = new Float32Array(w * h);
      size.current = { w, h };
      setLoaded(true); setHasMask(false); setTool("pick");
      setMsg("Tap on your hair to select it, then fine-tune with the brush.");
    };
    img.onerror = () => setMsg("That photo couldn't be opened. Try another.");
    img.src = src;
  };

  const render = useCallback(() => {
    const c = view.current, b = base.current, m = mask.current;
    if (!c || !b || !m) return;
    const { w, h } = size.current;
    const out = new ImageData(new Uint8ClampedArray(b.data), w, h);
    const [tr, tg, tb] = hex2rgb(shade.hex);
    const lt = 0.3 * tr + 0.59 * tg + 0.11 * tb;
    // vertical extent of the mask for "roots"
    let top = h, bottom = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 4) if (m[y * w + x] > 0.3) { if (y < top) top = y; if (y > bottom) bottom = y; }
    const splitX = Math.round((split / 100) * w);
    const a0 = strength / 100;
    for (let y = 0; y < h; y++) {
      for (let x = splitX; x < w; x++) {
        const i = y * w + x; let a = m[i]; if (a <= 0) continue;
        if (area === "roots") a *= Math.max(0, 1 - (y - top) / Math.max(1, (bottom - top) * 0.28));
        if (area === "highlights") a *= (Math.sin((x + y * 0.35) / 5.5) > 0.35 ? 1 : 0.08);
        a *= a0; if (a <= 0.001) continue;
        const p = i * 4, r = b.data[p], g = b.data[p + 1], bl = b.data[p + 2];
        const L = 0.3 * r + 0.59 * g + 0.11 * bl;
        const L2 = L + (lt - L) * 0.62; // lift or deepen toward the target level
        const d = L2 - lt;
        out.data[p] = r + (Math.max(0, Math.min(255, tr + d)) - r) * a;
        out.data[p + 1] = g + (Math.max(0, Math.min(255, tg + d)) - g) * a;
        out.data[p + 2] = bl + (Math.max(0, Math.min(255, tb + d)) - bl) * a;
      }
    }
    const ctx = c.getContext("2d")!;
    ctx.putImageData(out, 0, 0);
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(splitX - 1, 0, 2, h);
  }, [shade, strength, area, split]);

  useEffect(() => { render(); }, [render, hasMask]);

  const pos = (e: React.PointerEvent) => {
    const r = view.current!.getBoundingClientRect();
    return { x: Math.round(((e.clientX - r.left) / r.width) * size.current.w), y: Math.round(((e.clientY - r.top) / r.height) * size.current.h) };
  };
  function pick(x: number, y: number) {
    const b = base.current!, m = mask.current!, { w, h } = size.current;
    // average a 7×7 sample, then flood-fill by colour distance
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const p = (yy * w + xx) * 4; sr += b.data[p]; sg += b.data[p + 1]; sb += b.data[p + 2]; n++; }
    sr /= n; sg /= n; sb /= n;
    const tol = 62, seen = new Uint8Array(w * h), stack = [y * w + x];
    while (stack.length) {
      const i = stack.pop()!; if (seen[i]) continue; seen[i] = 1;
      const p = i * 4, dist = Math.hypot(b.data[p] - sr, b.data[p + 1] - sg, b.data[p + 2] - sb);
      if (dist > tol) continue;
      m[i] = Math.max(m[i], 1 - (dist / tol) * 0.35);
      const xx = i % w, yy = (i / w) | 0;
      if (xx > 0) stack.push(i - 1); if (xx < w - 1) stack.push(i + 1); if (yy > 0) stack.push(i - w); if (yy < h - 1) stack.push(i + w);
    }
    setHasMask((v) => !v || v); render(); setMsg("Selected. Tap more strands to add, or use the brush to tidy edges.");
  }
  function paint(x: number, y: number) {
    const m = mask.current!, { w, h } = size.current, r = brush;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const d = Math.hypot(dx, dy) / r; if (d > 1) continue;
      const i = yy * w + xx, v = 1 - d * d;
      m[i] = tool === "erase" ? Math.min(m[i], d * d) : Math.max(m[i], v);
    }
    render();
  }
  const down = (e: React.PointerEvent) => { if (!loaded) return; const { x, y } = pos(e); if (tool === "pick") return pick(x, y); painting.current = true; (e.target as Element).setPointerCapture(e.pointerId); paint(x, y); setHasMask(true); };
  const move = (e: React.PointerEvent) => { if (painting.current) { const { x, y } = pos(e); paint(x, y); } };

  async function save() {
    const r = await saveLook(shade.code, strength, area);
    if (!r.ok) setMsg(r.error === "signin" ? "Sign in to your account to save looks — your photo stays on this device." : r.error);
    else setMsg(`Saved ${shade.code} ${shade.name} to your looks.`);
  }
  function download() {
    const a = document.createElement("a"); a.download = `salon-che-${shade.code}.png`;
    try { a.href = view.current!.toDataURL("image/png"); a.click(); } catch { setMsg("This sample photo can't be downloaded. Upload your own."); }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="relative rounded-[28px] overflow-hidden plinth ring-1 ring-noir/10 min-h-[420px] grid place-items-center">
          <canvas ref={view} onPointerDown={down} onPointerMove={move} onPointerUp={() => (painting.current = false)} className={`max-w-full max-h-[78vh] touch-none ${loaded ? "" : "hidden"} ${tool === "pick" ? "cursor-crosshair" : "cursor-cell"}`} aria-label="Your photo with the shade preview" />
          {!loaded && (
            <div className="text-center text-noir p-10">
              <p className="font-display text-5xl font-light">Start with a photo.</p>
              <p className="text-noir/60 mt-3 max-w-sm mx-auto">Face the camera in daylight with your hair visible. Your photo never leaves this device.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <label className="btn-gold cursor-pointer">Upload a photo<input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) load(URL.createObjectURL(f)); }} /></label>
                <button className="btn-ghost" onClick={() => load(SAMPLE, true)}>Use a sample photo</button>
              </div>
            </div>
          )}
          {loaded && <><span className="absolute top-4 left-4 tag-price !bg-noir/70 !text-ivory !border-noir/20">Before</span><span className="absolute top-4 right-4 tag-price !bg-noir/70 !text-ivory !border-noir/20">After</span></>}
        </div>
        {loaded && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-4 text-sm"><span className="w-24 text-taupe">Before / after</span><input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(+e.target.value)} className="flex-1" /></label>
            <div className="flex flex-wrap items-center gap-2">
              {(["pick", "brush", "erase"] as const).map((t) => <button key={t} onClick={() => setTool(t)} className={`chip ${tool === t ? "chip-on" : ""}`}>{t === "pick" ? "Tap to select hair" : t === "brush" ? "Brush" : "Eraser"}</button>)}
              {tool !== "pick" && <label className="flex items-center gap-2 text-sm ml-2">Size<input type="range" min={8} max={70} value={brush} onChange={(e) => setBrush(+e.target.value)} className="" /></label>}
              <button className="chip ml-auto" onClick={() => { mask.current?.fill(0); setHasMask(false); render(); }}>Clear selection</button>
            </div>
            {msg && <p className="text-sm text-gold-deep">{msg}</p>}
          </div>
        )}
      </div>
      <aside className="lg:col-span-4 space-y-6">
        <div className="card p-6 bg-white">
          <p className="label">Pick a shade</p>
          <div className="grid grid-cols-5 gap-2">
            {SHADES.map((s) => (
              <button key={s.code} onClick={() => setShade(s)} aria-pressed={shade.code === s.code} title={`${s.code} ${s.name}`}
                className={`aspect-[3/4] rounded-xl flex flex-col justify-end p-1.5 text-[9px] font-bold tracking-[0.02em] transition ${shade.code === s.code ? "ring-4 ring-gold/50 scale-105" : "hover:-translate-y-0.5"}`}
                style={{ background: s.hex, color: ["9A", "10P", "8G"].includes(s.code) ? "#15110F" : "#fff" }}>{s.code}</button>
            ))}
          </div>
          <p className="font-display text-2xl mt-4">{shade.code} · {shade.name}</p>
        </div>
        <div className="card p-6 bg-white space-y-5">
          <div><p className="label">Strength</p><input type="range" min={10} max={100} value={strength} onChange={(e) => setStrength(+e.target.value)} className="w-full" /><div className="flex justify-between text-xs text-taupe"><span>A hint</span><span>Full color</span></div></div>
          <div><p className="label">Where</p><div className="flex flex-wrap gap-2">{([["all", "All over"], ["highlights", "Highlights"], ["roots", "Roots"]] as const).map(([v, l]) => <button key={v} onClick={() => setArea(v)} className={`chip ${area === v ? "chip-on" : ""}`}>{l}</button>)}</div></div>
        </div>
        <div className="rounded-2xl bg-cream p-5 text-sm"><p className="font-semibold">A preview, not a promise</p><p className="text-taupe mt-1">Screens and lighting change how color looks. Lee will tell you what your hair can reach in one visit.</p></div>
        <div className="flex flex-col gap-2">
          <button className="btn-dark" disabled={!loaded} onClick={save}>Save this look</button>
          <Link href={`/book?cat=${area === "highlights" ? "highlights" : "color"}`} className="btn-gold">Book this color</Link>
          <button className="btn-ghost" disabled={!loaded} onClick={download}>Download preview</button>
          {loaded && <button className="text-sm underline text-taupe mt-1" onClick={() => setLoaded(false)}>Start over with a new photo</button>}
        </div>
      </aside>
    </div>
  );
}
