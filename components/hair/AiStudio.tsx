"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AI_COLOURS, AI_STYLES, type AiStyle } from "@/lib/ai-styles";
import { saveLook } from "@/app/actions";

type Result = { style: AiStyle; colour: string; url: string };
const LOADING = ["Sectioning the hair…", "Picking up the shears…", "Cutting in the shape…", "Blow-drying…", "Finishing with a little shine…"];

/** Resize to a sensible size for the model (longest side 1024) and return base64 JPEG. */
async function prep(src: CanvasImageSource, w: number, h: number, mirror = false) {
  const s = Math.min(1, 1024 / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
  const x = c.getContext("2d")!;
  if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
  x.drawImage(src, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.9);
  return { url, b64: url.split(",")[1] };
}

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => { const r = box.current!.getBoundingClientRect(); setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))); };
  return (
    <div ref={box} className="relative select-none overflow-hidden rounded-[24px] ring-1 ring-noir/10 touch-none cursor-ew-resize"
      onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); move(e.clientX); }} onPointerMove={(e) => e.buttons && move(e.clientX)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="You with the new haircut" className="block w-full h-auto" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="You now" className="block w-full h-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-[#f0eae1] shadow-[0_0_12px_rgba(0,0,0,.5)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-[#f0eae1] text-[#15110f] grid place-items-center text-sm shadow-lg">⇆</span>
      </div>
      <span className="absolute top-3 left-3 rounded-full bg-black/55 text-white px-3 py-1 text-xs">Before</span>
      <span className="absolute top-3 right-3 rounded-full bg-black/55 text-white px-3 py-1 text-xs">After</span>
    </div>
  );
}

export default function AiStudio({ initialWho }: { initialWho?: "women" | "men" }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [who, setWho] = useState<"women" | "men">(initialWho ?? "women");
  const [style, setStyle] = useState<AiStyle>(AI_STYLES.find((s) => s.who === (initialWho ?? "women"))!);
  const [colour, setColour] = useState("natural");
  const [photo, setPhoto] = useState<{ url: string; b64: string } | null>(null);
  const [camera, setCamera] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => { fetch("/api/tryon").then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);
  useEffect(() => { if (!busy) return; const id = setInterval(() => setStep((s) => (s + 1) % LOADING.length), 2200); return () => clearInterval(id); }, [busy]);

  async function openCamera() {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      stream.current = s; setCamera(true);
      requestAnimationFrame(async () => { const v = video.current!; v.srcObject = s; await v.play(); });
    } catch { setErr("Camera permission was blocked. Allow the camera, or upload a photo instead."); }
  }
  async function snap() {
    const v = video.current!;
    setPhoto(await prep(v, v.videoWidth, v.videoHeight, true));
    stream.current?.getTracks().forEach((t) => t.stop()); setCamera(false);
  }
  async function upload(f: File) {
    const img = new Image(); img.src = URL.createObjectURL(f);
    try { await img.decode(); setPhoto(await prep(img, img.naturalWidth, img.naturalHeight)); } catch { setErr("That file couldn't be opened. Try a JPG or PNG."); }
  }
  async function generate() {
    if (!photo) return;
    setErr(""); setBusy(true); setStep(0);
    try {
      const r = await fetch("/api/tryon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: photo.b64, mime: "image/jpeg", style: style.id, colour }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong.");
      const next = [{ style, colour, url: `data:${d.mime};base64,${d.image}` }, ...results].slice(0, 12);
      setResults(next); setActive(0);
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  const list = AI_STYLES.filter((s) => s.who === who);
  const cur = results[active];
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-5">
        {enabled === false && (
          <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">The photo-real try-on switches on once the salon adds its AI key. Until then, try the <Link href="/try-on?mode=live" className="underline">live mirror</Link>.</p>
        )}
        <div className="relative overflow-hidden rounded-[28px] plinth ring-1 ring-noir/10 min-h-[440px] grid place-items-center">
          {busy && photo ? (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="block w-full h-auto opacity-40 blur-[2px]" />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <svg viewBox="0 0 64 64" className="mx-auto h-20 w-20 text-gold animate-[spin_2.4s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="46" r="7" /><circle cx="46" cy="46" r="7" /><path d="M23 41 L48 10 M41 41 L16 10" strokeLinecap="round" /></svg>
                  <p className="font-display text-3xl mt-4">{LOADING[step]}</p>
                  <p className="text-sm text-taupe mt-1">{style.name} · about 10–20 seconds</p>
                </div>
              </div>
            </div>
          ) : cur && photo ? (
            <div className="w-full"><BeforeAfter before={photo.url} after={cur.url} /></div>
          ) : camera ? (
            <div className="w-full">
              <video ref={video} playsInline muted className="block w-full h-auto -scale-x-100" />
              <button onClick={snap} className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-[#f0eae1] ring-4 ring-[#f0eae1]/40" aria-label="Take photo" />
            </div>
          ) : photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="Your photo" className="block w-full h-auto" />
          ) : (
            <div className="text-center p-10 max-w-md">
              <p className="font-display text-4xl">Your new cut, for real.</p>
              <p className="text-taupe mt-3">Take a selfie or upload a photo, pick a haircut, and see yourself with it — photo-real, same face, same light.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button className="btn-gold" onClick={openCamera}>Take a selfie</button>
                <label className="btn-ghost cursor-pointer">Upload a photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} /></label>
              </div>
              <p className="text-xs text-taupe mt-5">Best results: face the camera, good light, hair visible, one person.</p>
            </div>
          )}
        </div>
        {err && <p role="alert" className="text-danger text-sm">{err}</p>}
        {photo && !busy && (
          <div className="flex flex-wrap gap-2">
            {cur && <a href={cur.url} download={`salon-che-${cur.style.id}.png`} className="chip">Download</a>}
            {cur && <button className="chip" onClick={async () => { const r = await saveLook("AI", 100, `ai:${cur.style.id}`); setMsg(r.ok ? "Saved to your looks." : r.error === "signin" ? "Sign in to your account to save looks." : r.error); }}>Save look</button>}
            <button className="chip ml-auto" onClick={() => { setPhoto(null); setResults([]); }}>New photo</button>
          </div>
        )}
        {msg && <p className="text-sm text-gold">{msg}</p>}
        {results.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {results.map((r, i) => (
              <button key={i} onClick={() => setActive(i)} className={`shrink-0 text-left ${i === active ? "" : "opacity-70 hover:opacity-100"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.style.name} className={`h-28 w-auto rounded-xl ${i === active ? "ring-2 ring-gold" : "ring-1 ring-noir/10"}`} />
                <span className="block text-xs mt-1 max-w-28 truncate">{r.style.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <aside className="lg:col-span-5 space-y-5">
        <div className="card p-5">
          <div className="flex gap-2 mb-4">{(["women", "men"] as const).map((w) => <button key={w} onClick={() => { setWho(w); setStyle(AI_STYLES.find((s) => s.who === w)!); }} className={`chip ${who === w ? "chip-on" : ""}`}>{w === "women" ? "Women" : "Men"}</button>)}</div>
          <p className="label">Choose a cut</p>
          <div className="grid grid-cols-2 gap-2">
            {list.map((s) => (
              <button key={s.id} onClick={() => setStyle(s)} aria-pressed={style.id === s.id} className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${style.id === s.id ? "border-gold bg-gold/10" : "border-noir/10 hover:border-noir/40"}`}>{s.name}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-2">{AI_COLOURS.map((c) => <button key={c.id} onClick={() => setColour(c.id)} className={`chip !py-1.5 !text-xs ${colour === c.id ? "chip-on" : ""}`}>{c.name}</button>)}</div>
        </div>
        <label className="flex gap-3 items-start text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4" /><span>I agree my photo is sent to Google&apos;s Gemini AI to create this preview. Salon Ché doesn&apos;t store it.</span></label>
        <button className="btn-gold w-full" disabled={!photo || !agree || busy || enabled === false} onClick={generate}>{busy ? "Creating your look…" : `See me with a ${style.name.toLowerCase()}`}</button>
        <Link href={`/book?cat=${style.service}`} className="btn-dark w-full">Book {style.name.toLowerCase()}</Link>
        <p className="text-xs text-taupe">An AI preview, not a promise — Lee will tell you what your hair can do in one visit.</p>
      </aside>
    </div>
  );
}
