import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import { q } from "@/lib/db";
import { fmtDate } from "@/lib/time";
import { SALON } from "@/lib/content";

export const metadata = { title: "Reviews" };
export default async function Reviews() {
  const reviews = await q<{ id: number; author: string; rating: number; body: string; service: string; reply: string | null; created_at: string }>(`SELECT * FROM reviews ORDER BY created_at DESC`);
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  return (
    <>
      <PageHero eyebrow="Reviews" title={<>What clients <em>say.</em></>} tag={<FeatureTag id="reviews" />} lead="Pulled from Salon Ché's Google Business Profile." />
      <div className="container-x pb-28 grid lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 lg:sticky lg:top-28 self-start card p-8 bg-cream">
          <p className="font-display text-8xl leading-none">{avg.toFixed(1)}</p>
          <p className="text-gold text-2xl tracking-widest mt-2">★★★★★</p>
          <p className="text-sm text-taupe mt-1">{reviews.length} reviews on Google</p>
          <ul className="mt-6 space-y-2">{dist.map((d) => (
            <li key={d.n} className="flex items-center gap-3 text-sm"><span className="w-3">{d.n}</span><span className="flex-1 h-1.5 rounded-full bg-sand overflow-hidden"><span className="block h-full bg-gold" style={{ width: `${(d.c / Math.max(1, reviews.length)) * 100}%` }} /></span><span className="w-4 text-taupe">{d.c}</span></li>
          ))}</ul>
          <a href={`https://www.google.com/search?q=${encodeURIComponent("Salon Che Nampa reviews")}`} target="_blank" rel="noreferrer" className="btn-dark btn-sm mt-8">Write a review on Google</a>
          <p className="text-xs text-taupe mt-4">Loved your visit? It means the world to a small salon. Questions: {SALON.phone}</p>
        </aside>
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <figure key={r.id} className="card p-7">
              <div className="flex justify-between"><span className="text-gold tracking-widest">{"★".repeat(r.rating)}<span className="text-sand">{"★".repeat(5 - r.rating)}</span></span><span className="text-xs text-stone">{fmtDate(r.created_at, { month: "short", day: "numeric", year: "numeric" })}</span></div>
              <blockquote className="mt-4 font-display text-2xl leading-snug">“{r.body}”</blockquote>
              <figcaption className="mt-5 text-sm"><span className="font-semibold">{r.author}</span> <span className="text-taupe">· {r.service}</span></figcaption>
              {r.reply ? <p className="mt-5 border-l-2 border-gold pl-4 text-sm text-taupe"><span className="font-semibold text-noir">Lee replied:</span> {r.reply}</p> : null}
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
