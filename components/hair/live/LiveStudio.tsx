"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision";
import { LIVE_IDS, LIVE_STYLES, drawHair, headFrom, hideOwnHair, recolourOwnHair, setOvalConnections, type Head, type LiveStyleId, type Look } from "./render";
import { SHADES } from "@/lib/shades";
import { saveLook } from "@/app/actions";

type Mode = "style" | "colour";
type Status = "idle" | "loading" | "live" | "photo" | "error";
const ENDS = [null, "#c8994f", "#e8e1d2", "#d6a0a0"] as const;
const ENDS_LABEL = ["None", "Honey ends", "Platinum ends", "Rose ends"];

/** Loads the face tracker and hair segmenter from files bundled with the site (no third-party CDN). */
async function loadModels() {
  const v = await import("@mediapipe/tasks-vision");
  const files = await v.FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const make = async <T,>(fn: (delegate: "GPU" | "CPU") => Promise<T>) => { try { return await fn("GPU"); } catch { return await fn("CPU"); } };
  const face = await make((delegate) => v.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: "/models/face_landmarker.task", delegate }, runningMode: "VIDEO", numFaces: 1 }));
  const hair = await make((delegate) => v.ImageSegmenter.createFromOptions(files, { baseOptions: { modelAssetPath: "/models/hair_segmenter.tflite", delegate }, runningMode: "VIDEO", outputConfidenceMasks: true, outputCategoryMask: false }));
  setOvalConnections(v.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL);
  return { face, hair };
}

export default function LiveStudio({ initialStyle }: { initialStyle?: string }) {
  const [mode, setMode] = useState<Mode>("style");
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");
  const [look, setLook] = useState<Look>({ style: (LIVE_IDS.includes(initialStyle as LiveStyleId) ? initialStyle : "beach-waves") as LiveStyleId, color: SHADES[2].hex, ends: null, size: 1, lift: 0, width: 1, density: 1 });
  const [hideMine, setHideMine] = useState(false);
  const [strength, setStrength] = useState(0.8);
  const [compare, setCompare] = useState(false);
  const [found, setFound] = useState(true);
  const [shots, setShots] = useState<string[]>([]);
  const [grid, setGrid] = useState<{ id: LiveStyleId; url: string }[] | null>(null);
  const [msg, setMsg] = useState("");

  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const photo = useRef<HTMLImageElement | null>(null);
  const models = useRef<{ face: FaceLandmarker; hair: ImageSegmenter } | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const state = useRef({ look, mode, hideMine, strength, compare });
  const lastHead = useRef<Head | null>(null);
  const prev = useRef<{ x: number; y: number } | null>(null);
  const sway = useRef({ x: 0, y: 0 });
  const mask = useRef<{ data: Float32Array; w: number; h: number } | null>(null);
  const frameNo = useRef(0);
  state.current = { look, mode, hideMine, strength, compare };

  const ensureModels = async () => { if (!models.current) models.current = await loadModels(); return models.current; };

  const renderFrame = useCallback((src: CanvasImageSource, w: number, h: number, ts: number, mirror: boolean) => {
    const c = canvas.current; if (!c || !models.current) return;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const S = state.current;
    ctx.save(); if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); } ctx.drawImage(src, 0, 0, w, h); ctx.restore();
    const res = models.current.face.detectForVideo(src as HTMLVideoElement, ts);
    const lm = res.faceLandmarks?.[0];
    setFound(!!lm);
    const needMask = (S.mode === "colour" || S.hideMine) && !S.compare;
    if (needMask && frameNo.current++ % 2 === 0) {
      const seg = models.current.hair.segmentForVideo(src as HTMLVideoElement, ts + 0.5);
      const m = seg.confidenceMasks?.[seg.confidenceMasks.length - 1];
      if (m) mask.current = { data: m.getAsFloat32Array().slice(), w: m.width, h: m.height };
      seg.close();
    }
    if (S.compare) return;
    if (S.mode === "colour") { if (mask.current) recolourOwnHair(ctx, mask.current.data, mask.current.w, mask.current.h, mirror, S.look.color, S.strength); return; }
    if (!lm) return;
    const head = headFrom(lm, w, h, mirror);
    // a little inertia so long hair swings when the head moves
    if (prev.current) { sway.current.x = sway.current.x * 0.85 - ((head.origin.x - prev.current.x) / head.unit) * 0.25; sway.current.y = sway.current.y * 0.85 - ((head.origin.y - prev.current.y) / head.unit) * 0.25; }
    prev.current = { ...head.origin };
    lastHead.current = head;
    if (S.hideMine && mask.current) hideOwnHair(ctx, mask.current.data, mask.current.w, mask.current.h, mirror);
    drawHair(ctx, head, S.look, ts / 1000, sway.current);
  }, []);

  const stop = useCallback(() => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; }, []);
  useEffect(() => stop, [stop]);

  async function startCamera() {
    setErr(""); setStatus("loading");
    try {
      const [s] = await Promise.all([navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }), ensureModels()]);
      stream.current = s;
      const v = video.current!; v.srcObject = s; await v.play();
      setStatus("live");
      const loop = () => {
        if (v.readyState >= 2) { const w = Math.min(1100, v.videoWidth), h = Math.round((w / v.videoWidth) * v.videoHeight); renderFrame(v, w, h, performance.now(), true); }
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      stop();
      setStatus("error");
      setErr(e instanceof DOMException && e.name === "NotAllowedError" ? "Camera permission was blocked. Allow the camera in your browser's address bar, or use a photo instead." : "We couldn't start the camera on this device. Try a photo instead.");
    }
  }

  async function usePhoto(src: string) {
    stop(); setErr(""); setStatus("loading");
    try {
      await ensureModels();
      const img = new Image(); img.src = src; await img.decode(); photo.current = img;
      setStatus("photo");
      const loop = () => { const w = Math.min(1100, img.naturalWidth), h = Math.round((w / img.naturalWidth) * img.naturalHeight); renderFrame(img, w, h, performance.now(), false); raf.current = requestAnimationFrame(loop); };
      loop();
    } catch { setStatus("error"); setErr("That photo couldn't be read. Try a clear, front-facing JPG or PNG."); }
  }

  function snap() {
    const c = canvas.current; if (!c) return;
    const url = c.toDataURL("image/jpeg", 0.92);
    setShots((s) => [url, ...s].slice(0, 8));
    setMsg("Snapped! It's in your strip below.");
  }

  /** Freezes the current frame and renders it in every style. */
  function everyStyle() {
    const c = canvas.current, head = lastHead.current;
    if (!c || !head) { setMsg("Face the camera so we can find you first."); return; }
    const base = document.createElement("canvas"); base.width = c.width; base.height = c.height;
    const bctx = base.getContext("2d")!;
    // re-draw the clean frame (no hair) as the base
    const src = status === "photo" ? photo.current! : video.current!;
    bctx.save(); if (status === "live") { bctx.translate(base.width, 0); bctx.scale(-1, 1); } bctx.drawImage(src, 0, 0, base.width, base.height); bctx.restore();
    const out: { id: LiveStyleId; url: string }[] = [];
    for (const id of LIVE_IDS) {
      const k = document.createElement("canvas"); k.width = base.width; k.height = base.height;
      const kctx = k.getContext("2d")!; kctx.drawImage(base, 0, 0);
      drawHair(kctx, head, { ...look, style: id }, 0);
      // crop around the head
      const u = head.unit, cx = head.origin.x, cy = head.origin.y + u * 1.1, side = u * 5.2;
      const crop = document.createElement("canvas"); crop.width = 360; crop.height = 420;
      crop.getContext("2d")!.drawImage(k, cx - side / 2, cy - side * 0.6, side, side * 1.17, 0, 0, 360, 420);
      out.push({ id, url: crop.toDataURL("image/jpeg", 0.85) });
    }
    setGrid(out);
  }

  const S = LIVE_STYLES[look.style];
  const running = status === "live" || status === "photo";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button onClick={() => setMode("style")} className={`chip ${mode === "style" ? "chip-on" : ""}`}>New hairstyle</button>
        <button onClick={() => setMode("colour")} className={`chip ${mode === "colour" ? "chip-on" : ""}`}>New colour on my own hair</button>
        <span className="ml-auto text-xs text-taupe">Runs entirely on your device — nothing is uploaded.</span>
      </div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-[28px] plinth ring-1 ring-noir/10 min-h-[420px] grid place-items-center">
            <video ref={video} playsInline muted className="hidden" />
            <canvas ref={canvas} className={`w-full h-auto ${running ? "block" : "hidden"}`} aria-label="Live preview of you with the new hairstyle" />
            {!running && (
              <div className="text-center p-10 max-w-md">
                <div className="mx-auto h-20 w-20 rounded-full border border-gold/50 grid place-items-center text-3xl">◉</div>
                <p className="font-display text-4xl mt-6">See yourself, live.</p>
                <p className="text-taupe mt-3">Turn on your camera, look straight ahead, and try every cut in the book on your own face — it follows you as you move.</p>
                {err && <p className="mt-4 text-danger text-sm">{err}</p>}
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button className="btn-gold" onClick={startCamera} disabled={status === "loading"}>{status === "loading" ? "Waking up the mirror…" : "Start camera"}</button>
                  <label className="btn-ghost cursor-pointer">Use a photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) usePhoto(URL.createObjectURL(f)); }} /></label>
                </div>
                <button className="mt-4 text-sm underline text-taupe" onClick={() => usePhoto("/photos/curly-smile.jpg")}>Try it on a sample face</button>
              </div>
            )}
            {running && !found && mode === "style" && <p className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full glass px-4 py-2 text-sm">Face the camera so we can find you</p>}
            {running && <span className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-xs flex items-center gap-2">{status === "live" ? <><span className="h-2 w-2 rounded-full bg-[#e5484d] animate-pulse" />Live</> : "Photo"}</span>}
            {running && compare && <span className="absolute top-4 right-4 rounded-full glass px-3 py-1 text-xs">Your hair now</span>}
          </div>
          {running && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onPointerDown={() => setCompare(true)} onPointerUp={() => setCompare(false)} onPointerLeave={() => setCompare(false)} className="chip select-none">Hold to compare</button>
              <button onClick={snap} className="chip">📸 Snap</button>
              {mode === "style" && <button onClick={everyStyle} className="chip">✨ Show me in every style</button>}
              {mode === "style" && <label className="chip cursor-pointer"><input type="checkbox" checked={hideMine} onChange={(e) => setHideMine(e.target.checked)} className="h-4 w-4" />Tuck my own hair (beta)</label>}
              <button onClick={() => { stop(); setStatus("idle"); }} className="chip ml-auto">Stop</button>
            </div>
          )}
          {msg && <p className="mt-3 text-sm text-gold">{msg}</p>}
          {shots.length > 0 && (
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {shots.map((s, i) => (
                <a key={i} href={s} download={`salon-che-${look.style}-${i + 1}.jpg`} className="shrink-0" title="Download">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt={`Snapshot ${i + 1}`} className="h-28 w-auto rounded-xl ring-1 ring-noir/10" />
                </a>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-5">
          {mode === "style" && (
            <div className="card p-5">
              <p className="label">Choose a cut</p>
              <div className="grid grid-cols-2 gap-2">
                {LIVE_IDS.map((id) => (
                  <button key={id} onClick={() => setLook({ ...look, style: id })} aria-pressed={look.style === id}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${look.style === id ? "border-gold bg-gold/10" : "border-noir/10 hover:border-noir/40"}`}>
                    <span className="block font-medium">{LIVE_STYLES[id].name}</span>
                    <span className="text-[11px] text-taupe">{LIVE_STYLES[id].who === "him" ? "For him" : LIVE_STYLES[id].who === "her" ? "For her" : "Everyone"}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-taupe mt-3">{S.blurb}</p>
            </div>
          )}
          <div className="card p-5">
            <p className="label">Colour</p>
            <div className="grid grid-cols-5 gap-2">
              {SHADES.map((s) => (
                <button key={s.code} onClick={() => setLook({ ...look, color: s.hex })} aria-pressed={look.color === s.hex} title={`${s.code} ${s.name}`}
                  className={`aspect-[3/4] rounded-t-full rounded-b-md text-[9px] font-medium flex items-end justify-center pb-1 transition ${look.color === s.hex ? "ring-2 ring-gold scale-105" : "hover:-translate-y-0.5"}`}
                  style={{ background: `linear-gradient(180deg, ${s.hex}, ${s.hex}cc)`, color: ["9A", "10P", "8G"].includes(s.code) ? "#15110F" : "#fff" }}>{s.code}</button>
              ))}
            </div>
            {mode === "style" ? (
              <div className="mt-4 flex flex-wrap gap-2">{ENDS.map((e, i) => <button key={i} onClick={() => setLook({ ...look, ends: e })} className={`chip !py-1.5 !text-xs ${look.ends === e ? "chip-on" : ""}`}>{ENDS_LABEL[i]}</button>)}</div>
            ) : (
              <label className="mt-4 flex items-center gap-3 text-sm"><span className="text-taupe w-20">Strength</span><input type="range" min={0.2} max={1} step={0.05} value={strength} onChange={(e) => setStrength(+e.target.value)} className="flex-1" /></label>
            )}
          </div>
          {mode === "style" && (
            <div className="card p-5 space-y-3 text-sm">
              <p className="label">Fit</p>
              {([["Size", "size", 0.8, 1.25, 0.01], ["Height", "lift", -0.4, 0.4, 0.01], ["Width", "width", 0.85, 1.2, 0.01], ["Thickness", "density", 0.4, 1.6, 0.05]] as const).map(([l, k, a, b, st]) => (
                <label key={k} className="flex items-center gap-3"><span className="w-20 text-taupe">{l}</span><input type="range" min={a} max={b} step={st} value={look[k]} onChange={(e) => setLook({ ...look, [k]: +e.target.value })} className="flex-1" /></label>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button className="btn-dark" onClick={async () => { const shade = SHADES.find((s) => s.hex === look.color) ?? SHADES[0]; const r = await saveLook(shade.code, 100, mode === "style" ? `live:${look.style}` : "all"); setMsg(r.ok ? "Saved to your looks." : r.error === "signin" ? "Sign in to your account to save looks." : r.error); }}>Save this look</button>
            <Link href={`/book?cat=${mode === "style" ? S.service : "color"}`} className="btn-gold">{mode === "style" ? `Book ${S.name.toLowerCase()}` : "Book this colour"}</Link>
          </div>
          <p className="text-xs text-taupe">A preview, not a promise — Lee will tell you what your hair can do in one visit.</p>
        </aside>
      </div>

      {grid && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-label="You in every style">
          <button className="absolute inset-0 bg-black/60" onClick={() => setGrid(null)} aria-label="Close" />
          <div className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-[24px] bg-ivory border border-noir/10 p-6">
            <div className="flex items-center justify-between mb-5"><p className="font-display text-4xl">You, twelve ways.</p><button className="btn-ghost btn-sm" onClick={() => setGrid(null)}>Close</button></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {grid.map((g) => (
                <button key={g.id} onClick={() => { setLook({ ...look, style: g.id }); setGrid(null); }} className="group text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={LIVE_STYLES[g.id].name} className="w-full rounded-2xl ring-1 ring-noir/10 group-hover:ring-gold transition" />
                  <p className="mt-2 font-medium">{LIVE_STYLES[g.id].name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
