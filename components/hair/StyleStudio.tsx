"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Caricature, { HairDefs, HairLayer, STYLES, SKINS, type StyleId } from "./Caricature";
import { SHADES } from "@/lib/shades";
import { saveLook } from "@/app/actions";

const SAMPLE = "/photos/curly-smile.jpg";
const IDS = Object.keys(STYLES) as StyleId[];

/** Turn a photo into a hand-drawn caricature: smooth, posterise, boost colour, ink the edges. */
function cartoonize(img: HTMLImageElement, max = 900) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(1.2px) saturate(1.25) contrast(1.05)";
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = "none";
  const im = ctx.getImageData(0, 0, w, h), d = im.data;
  const gray = new Float32Array(w * h);
  const L = 9, step = 255 / (L - 1), keep = 0.35;
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    gray[i] = 0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2];
    for (let k = 0; k < 3; k++) d[p + k] = d[p + k] * keep + Math.round(d[p + k] / step) * step * (1 - keep);
  }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
    const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
    const m = Math.sqrt(gx * gx + gy * gy);
    if (m > 140) { const p = i * 4, k = Math.max(0.2, 1 - (m - 140) / 220); d[p] *= k * 0.55; d[p + 1] *= k * 0.5; d[p + 2] *= k * 0.45; }
  }
  ctx.putImageData(im, 0, 0);
  return c.toDataURL("image/jpeg", 0.9);
}

export default function StyleStudio({ initialStyle }: { initialStyle?: string }) {
  const [style, setStyle] = useState<StyleId>(IDS.includes(initialStyle as StyleId) ? (initialStyle as StyleId) : "waves");
  const [shade, setShade] = useState(SHADES[2]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartoon, setCartoon] = useState<string | null>(null);
  const [useCartoon, setUseCartoon] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 30, s: 56, r: 0, gap: 1 });
  const [opacity, setOpacity] = useState(92);
  const [msg, setMsg] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => { setCartoon(null); setUseCartoon(false); }, [photo]);

  const load = (src: string) => { setPhoto(src); setPos({ x: 50, y: 30, s: 56, r: 0, gap: 1 }); setMsg("Drag the hair onto your head, then use Size and Tilt to fit."); };
  const toggleCartoon = () => {
    if (!photo) return;
    if (!cartoon && imgRef.current) { try { setCartoon(cartoonize(imgRef.current)); } catch { setMsg("That photo can't be cartoonised — try uploading your own."); return; } }
    setUseCartoon((v) => !v);
  };
  const down = (e: React.PointerEvent) => { (e.target as Element).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; };
  const move = (e: React.PointerEvent) => {
    if (!drag.current || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    setPos((p) => ({ ...p, x: drag.current!.px + ((e.clientX - drag.current!.x) / r.width) * 100, y: drag.current!.py + ((e.clientY - drag.current!.y) / r.height) * 100 }));
  };

  async function download() {
    const st = stage.current, im = imgRef.current;
    if (!st || !im) return;
    const W = im.naturalWidth > 1400 ? 1400 : im.naturalWidth, H = Math.round((W / im.naturalWidth) * im.naturalHeight);
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    const base = new Image(); base.src = useCartoon && cartoon ? cartoon : photo!;
    await base.decode(); ctx.drawImage(base, 0, 0, W, H);
    const svgEl = st.querySelector("svg[data-overlay]") as SVGSVGElement;
    const rect = st.getBoundingClientRect(), o = svgEl.getBoundingClientRect();
    const xml = new XMLSerializer().serializeToString(svgEl);
    const hair = new Image(); hair.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    await hair.decode();
    const k = W / rect.width;
    ctx.save(); ctx.globalAlpha = opacity / 100;
    ctx.translate((o.left - rect.left + o.width / 2) * k, (o.top - rect.top + o.height / 2) * k);
    ctx.drawImage(hair, (-o.width / 2) * k, (-o.height / 2) * k, o.width * k, o.height * k);
    ctx.restore();
    ctx.font = `${Math.round(W / 40)}px Italiana, serif`; ctx.fillStyle = "rgba(240,230,214,.85)"; ctx.fillText("Salon Ché · try-on", W * 0.03, H - W * 0.03);
    const a = document.createElement("a"); a.download = `salon-che-${style}.png`; a.href = c.toDataURL("image/png"); a.click();
  }

  const S = STYLES[style];
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div ref={stage} className="relative overflow-hidden rounded-[28px] plinth ring-1 ring-noir/10 min-h-[460px] grid place-items-center select-none">
          {photo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={useCartoon && cartoon ? cartoon : photo} alt="Your photo" className="block w-full h-auto" crossOrigin="anonymous" />
              <svg data-overlay viewBox="0 0 200 240" width="200" height="240" onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)}
                className="absolute cursor-grab active:cursor-grabbing touch-none drop-shadow-[0_6px_14px_rgba(0,0,0,.35)]"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.s}%`, height: "auto", opacity: opacity / 100, transform: `translate(-50%, -50%) rotate(${pos.r}deg)` }} aria-label="Hairstyle overlay — drag to move">
                <HairDefs id="ov" color={shade.hex} />
                <mask id="ov-face"><rect width="200" height="240" fill="#fff" /><ellipse cx="100" cy="112" rx={44 * pos.gap} ry={58 * pos.gap} fill="#000" /></mask>
                <g mask="url(#ov-face)"><HairLayer style={style} color={shade.hex} id="ov" part="back" /></g>
                <HairLayer style={style} color={shade.hex} id="ov" part="front" />
              </svg>
            </>
          ) : (
            <div className="grid md:grid-cols-2 items-center gap-6 p-8 w-full">
              <Caricature id="studio-model" style={style} color={shade.hex} skin={SKINS[1]} face="oval" beard={!!S.men && style !== "buzz"} mood="grin" shirt="#2c2420" className="w-full max-w-[320px] mx-auto" />
              <div className="text-center md:text-left">
                <p className="font-display text-4xl">Now on you.</p>
                <p className="text-taupe mt-2">Upload a front-facing selfie, or try the sample. Your photo stays on your device.</p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <label className="btn-gold cursor-pointer">Upload a selfie<input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) load(URL.createObjectURL(f)); }} /></label>
                  <button className="btn-ghost" onClick={() => load(SAMPLE)}>Use a sample</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {photo && (
          <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {([["Size", "s", 25, 120], ["Tilt", "r", -30, 30], ["Face opening", "gap", 0.6, 1.5]] as const).map(([l, k, a, b]) => (
              <label key={k} className="flex items-center gap-3"><span className="w-28 text-taupe">{l}</span><input type="range" min={a} max={b} step={k === "gap" ? 0.02 : 1} value={pos[k]} onChange={(e) => setPos({ ...pos, [k]: +e.target.value })} className="flex-1" /></label>
            ))}
            <label className="flex items-center gap-3"><span className="w-28 text-taupe">Blend</span><input type="range" min={40} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="flex-1" /></label>
            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
              <button onClick={toggleCartoon} className={`chip ${useCartoon ? "chip-on" : ""}`}>✏︎ Cartoon me</button>
              <button onClick={download} className="chip">Download</button>
              <button onClick={() => setPhoto(null)} className="chip ml-auto">New photo</button>
            </div>
            {msg && <p className="sm:col-span-2 text-gold">{msg}</p>}
          </div>
        )}
      </div>

      <aside className="lg:col-span-4 space-y-6">
        <div className="card p-5">
          <p className="label">Choose a cut</p>
          <div className="grid grid-cols-4 gap-2">
            {IDS.map((id) => (
              <button key={id} onClick={() => setStyle(id)} aria-pressed={style === id} title={STYLES[id].name}
                className={`rounded-xl border p-1 transition ${style === id ? "border-gold bg-gold/10" : "border-noir/10 hover:border-noir/40"}`}>
                <Caricature id={`pick-${id}`} style={id} color={shade.hex} skin={SKINS[1]} shirt="#3a2a20" mood="calm" className="w-full" />
              </button>
            ))}
          </div>
          <p className="font-display text-2xl mt-4">{S.name}</p>
          <p className="text-sm text-taupe">{S.blurb}</p>
        </div>
        <div className="card p-5">
          <p className="label">Colour</p>
          <div className="grid grid-cols-5 gap-2">
            {SHADES.map((s) => (
              <button key={s.code} onClick={() => setShade(s)} aria-pressed={shade.code === s.code} title={`${s.code} ${s.name}`}
                className={`aspect-[3/4] rounded-t-full rounded-b-md text-[9px] font-medium flex items-end justify-center pb-1 transition ${shade.code === s.code ? "ring-2 ring-gold scale-105" : "hover:-translate-y-0.5"}`}
                style={{ background: `linear-gradient(180deg, ${s.hex}, ${s.hex}cc)`, color: ["9A", "10P", "8G"].includes(s.code) ? "#15110F" : "#fff" }}>{s.code}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-dark" onClick={async () => { const r = await saveLook(shade.code, 100, `style:${style}`); setMsg(r.ok ? `Saved ${S.name} in ${shade.name} to your looks.` : r.error === "signin" ? "Sign in to your account to save looks." : r.error); }}>Save this look</button>
          <Link href={`/book?cat=${S.service}`} className="btn-gold">Book {S.name.toLowerCase()}</Link>
        </div>
        <p className="text-xs text-taupe">A playful preview — real hair has its own mind. Lee will tell you what your hair can do.</p>
      </aside>
    </div>
  );
}
