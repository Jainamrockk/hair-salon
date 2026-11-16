"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto, resetGallery, saveGallery, setProductPhoto, setSlotPhoto, uploadPhoto } from "@/app/photo-actions";

type Slot = { key: string; group: string; label: string; hint: string; def: string; shape: "arch" | "wide"; src: string };
type Item = { src: string; title: string; cat: string; s: string };
type Media = { id: number; url: string; name: string; width: number; height: number; bytes: number };
type Product = { slug: string; brand: string; name: string; image: string };
const CATS: [string, string][] = [["cuts", "Cuts & styling"], ["color", "Color"], ["highlights", "Highlights"], ["perms", "Perms"], ["smoothing", "Smoothing"], ["treatments", "Treatments"], ["waxing", "Waxing"], ["him", "For him"]];
const TABS = [["slots", "Site photos"], ["work", "Work gallery"], ["reel", "Homepage reel"], ["products", "Shop products"], ["library", "Library"]] as const;

/** Resize in the browser so uploads are small and fast: longest side 1800px, JPEG ~82%. */
async function compress(file: File) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.82));
  const b64 = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.readAsDataURL(blob); });
  return { name: file.name, mime: "image/jpeg", b64, width: w, height: h };
}

function Thumb({ src, shape = "wide", className = "" }: { src: string; shape?: "arch" | "wide"; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`object-cover bg-cream ${shape === "arch" ? "rounded-t-full rounded-b-md aspect-[3/4]" : "rounded-xl aspect-[16/10]"} ${className}`} />;
}

export default function PhotoManager({ slots, media, builtIn, work, reel, products }: { slots: Slot[]; media: Media[]; builtIn: string[]; work: Item[]; reel: Item[]; products: Product[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("slots");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState<null | ((url: string) => void)>(null);
  const [workList, setWork] = useState(work);
  const [reelList, setReel] = useState(reel);
  const [dirty, setDirty] = useState<{ work?: boolean; reel?: boolean }>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const onUploaded = useRef<((url: string) => void) | null>(null);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let last = "";
    try {
      for (const f of Array.from(files).slice(0, 10)) {
        if (!f.type.startsWith("image/")) continue;
        const r = await uploadPhoto(await compress(f));
        if (!r.ok) { flash(r.error); continue; }
        last = r.url;
      }
      if (last && onUploaded.current) { onUploaded.current(last); onUploaded.current = null; setPicker(null); }
      flash("Uploaded.");
      router.refresh();
    } catch { flash("Couldn't read that photo. Try a JPG or PNG."); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  const pick = (cb: (url: string) => void) => setPicker(() => cb);
  const run = (f: () => Promise<unknown>, m: string) => start(async () => { await f(); flash(m); router.refresh(); });

  const gallery = (which: "work" | "reel") => {
    const list = which === "work" ? workList : reelList;
    const set = (l: Item[]) => { (which === "work" ? setWork : setReel)(l); setDirty((d) => ({ ...d, [which]: true })); };
    const move = (i: number, d: number) => { const l = [...list]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; set(l); };
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-taupe text-sm">{which === "work" ? "The Work page gallery. Clients can filter by category and book the look." : "The moving strip of photos on the homepage."} {list.length} photos.</p>
          <div className="flex gap-2">
            <button className="btn-ghost btn-sm" onClick={() => pick((url) => set([...list, { src: url, title: "New look", cat: "Cuts & styling", s: "cuts" }]))}>+ Add photo</button>
            <button className="btn-dark btn-sm" disabled={!dirty[which] || pending} onClick={() => run(async () => { await saveGallery(which, list); setDirty((d) => ({ ...d, [which]: false })); }, "Published.")}>Publish changes</button>
          </div>
        </div>
        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((it, i) => (
            <li key={i + it.src} className="rounded-2xl bg-white border border-sand p-3 flex gap-3">
              <button onClick={() => pick((url) => set(list.map((x, k) => (k === i ? { ...x, src: url } : x))))} className="w-24 shrink-0" title="Change photo"><Thumb src={it.src} shape="arch" /></button>
              <div className="flex-1 min-w-0 space-y-2">
                <input className="input !py-1.5 !text-sm" value={it.title} onChange={(e) => set(list.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} aria-label="Caption" />
                {which === "work" && (
                  <select className="input !py-1.5 !text-sm" value={it.s} onChange={(e) => { const c = CATS.find(([v]) => v === e.target.value)!; set(list.map((x, k) => (k === i ? { ...x, s: c[0], cat: c[1] } : x))); }} aria-label="Category">
                    {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                )}
                <div className="flex gap-1 text-sm">
                  <button className="chip !px-2.5 !py-1" onClick={() => move(i, -1)} aria-label="Move earlier">↑</button>
                  <button className="chip !px-2.5 !py-1" onClick={() => move(i, 1)} aria-label="Move later">↓</button>
                  <button className="chip !px-2.5 !py-1 ml-auto" onClick={() => set(list.filter((_, k) => k !== i))}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button className="mt-6 text-sm underline text-taupe" onClick={() => { if (confirm("Put back the original photos for this section?")) run(async () => { await resetGallery(which); location.reload(); }, "Reset."); }}>Reset to the original photos</button>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? "chip-on" : ""}`}>{l}</button>)}
        <label className={`btn-gold btn-sm ml-auto cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`}>
          {busy ? "Uploading…" : "Upload photos"}
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      {msg && <p role="status" className="mb-4 rounded-xl bg-gold/15 border border-gold/30 px-4 py-2 text-sm">{msg}</p>}

      {tab === "slots" && [...new Set(slots.map((s) => s.group))].map((g) => (
        <section key={g} className="mb-10">
          <h2 className="font-display text-3xl mb-4">{g}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.filter((s) => s.group === g).map((s) => (
              <div key={s.key} className="rounded-2xl bg-white border border-sand p-4 flex flex-col">
                <Thumb src={s.src} shape={s.shape} className="w-full" />
                <p className="font-semibold mt-3">{s.label}</p>
                <p className="text-xs text-taupe flex-1">{s.hint}</p>
                <div className="flex gap-2 mt-3">
                  <button className="btn-dark btn-sm" disabled={pending} onClick={() => pick((url) => run(() => setSlotPhoto(s.key, url), `${s.label} updated — live now.`))}>Change</button>
                  {s.src !== s.def && <button className="btn-ghost btn-sm" disabled={pending} onClick={() => run(() => setSlotPhoto(s.key, null), "Back to the original photo.")}>Reset</button>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {tab === "work" && gallery("work")}
      {tab === "reel" && gallery("reel")}

      {tab === "products" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.slug} className="rounded-2xl bg-white border border-sand p-4">
              <Thumb src={p.image} shape="arch" className="w-full" />
              <p className="text-xs text-taupe mt-3">{p.brand}</p><p className="font-semibold">{p.name}</p>
              <button className="btn-dark btn-sm mt-3" onClick={() => pick((url) => run(() => setProductPhoto(p.slug, url), `${p.name} photo updated.`))}>Change photo</button>
            </div>
          ))}
        </div>
      )}

      {tab === "library" && (
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-3xl mb-4">Your uploads</h2>
            {media.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {media.map((m) => (
                  <div key={m.id} className="rounded-xl bg-white border border-sand p-2">
                    <Thumb src={m.url} className="w-full" />
                    <p className="text-[11px] text-taupe mt-1 truncate" title={m.name}>{m.name}</p>
                    <p className="text-[11px] text-stone">{m.width}×{m.height} · {Math.round(m.bytes / 1024)} KB</p>
                    <button className="text-xs underline text-taupe mt-1" onClick={() => start(async () => { const r = await deletePhoto(m.id); flash(r.ok ? "Deleted." : r.error); router.refresh(); })}>Delete</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-taupe">No uploads yet. Use “Upload photos” — straight from your phone works too.</p>}
          </section>
          <section>
            <h2 className="font-display text-3xl mb-4">Built-in photos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-2">{builtIn.map((u) => <Thumb key={u} src={u} className="w-full" />)}</div>
          </section>
        </div>
      )}

      {picker && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-label="Choose a photo">
          <button className="absolute inset-0 bg-black/50" onClick={() => setPicker(null)} aria-label="Close" />
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[22px] bg-ivory border border-sand p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="font-display text-3xl">Choose a photo</p>
              <div className="flex gap-2">
                <label className={`btn-gold btn-sm cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`}>
                  {busy ? "Uploading…" : "Upload new"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { onUploaded.current = picker; upload(e.target.files); }} />
                </label>
                <button className="btn-ghost btn-sm" onClick={() => setPicker(null)}>Cancel</button>
              </div>
            </div>
            {media.length ? <p className="label">Your uploads</p> : null}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {media.map((m) => <button key={m.id} onClick={() => { picker(m.url); setPicker(null); }} className="hover:ring-2 ring-gold rounded-xl"><Thumb src={m.url} className="w-full" /></button>)}
            </div>
            <p className="label">Built-in photos</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {builtIn.map((u) => <button key={u} onClick={() => { picker(u); setPicker(null); }} className="hover:ring-2 ring-gold rounded-xl"><Thumb src={u} className="w-full" /></button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
