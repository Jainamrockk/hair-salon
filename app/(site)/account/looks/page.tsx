import Link from "next/link";
import FeatureTag from "@/components/FeatureTag";
import { clientId } from "@/lib/auth";
import { q } from "@/lib/db";
import { CATEGORIES } from "@/lib/content";
import { fmtDate } from "@/lib/time";
import { deleteLook } from "@/app/actions";
import { SHADES } from "@/lib/shades";
import Caricature, { STYLES, type StyleId } from "@/components/hair/Caricature";

export const metadata = { title: "Saved looks" };
export default async function Looks() {
  const cid = (await clientId())!;
  const looks = await q<{ id: number; shade: string; strength: number; area: string; created_at: string }>(`SELECT * FROM saved_looks WHERE client_id = $1 ORDER BY created_at DESC`, [cid]);
  const colorId = CATEGORIES.find((c) => c.id === "color");
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="font-display text-5xl font-light">Saved looks</h1><FeatureTag id="try-on" /></div>
      <p className="text-taupe mt-2">Shades and hairstyles you saved in the virtual try-on. Photos stay on your device — only the shade is saved.</p>
      {looks.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {looks.map((l) => { const s = SHADES.find((x) => x.code === l.shade) ?? SHADES[0]; return (
            <div key={l.id} className="card p-6 bg-white">
              {l.area.startsWith("style:") && STYLES[l.area.slice(6) as StyleId]
                ? <div className="niche plinth overflow-hidden pt-3"><Caricature id={`saved-${l.id}`} style={l.area.slice(6) as StyleId} color={s.hex} mood="grin" shirt="#2c2420" className="mx-auto w-2/3" /></div>
                : <div className="h-36 rounded-2xl" style={{ background: `linear-gradient(135deg, ${s.hex}, ${s.hex}cc 60%, #f6f1ea)` }} />}
              <p className="eyebrow mt-4">{s.code} · {s.name}</p>
              <p className="font-display text-2xl">{l.area.startsWith("style:") ? STYLES[l.area.slice(6) as StyleId]?.name ?? "Hairstyle" : `${l.area === "all" ? "All over" : l.area === "highlights" ? "Highlights" : "Roots"} · ${l.strength}%`}</p>
              <p className="text-xs text-stone">{fmtDate(l.created_at)}</p>
              <div className="flex gap-2 mt-4">
                <Link href={l.area.startsWith("style:") ? `/try-on?mode=style&style=${l.area.slice(6)}` : `/book?cat=${l.area === "highlights" ? "highlights" : colorId?.id}`} className="btn-dark btn-sm">{l.area.startsWith("style:") ? "Try it again" : "Book this color"}</Link>
                <form action={deleteLook.bind(null, l.id)}><button className="btn-ghost btn-sm">Delete</button></form>
              </div>
            </div>
          ); })}
        </div>
      ) : (
        <div className="card p-9 bg-white mt-8"><p className="font-display text-3xl">No looks yet.</p><p className="text-taupe mt-1">Try a shade on your own photo and save the ones you love.</p><Link href="/try-on" className="btn-dark btn-sm mt-5">Open try-on</Link></div>
      )}
    </div>
  );
}
