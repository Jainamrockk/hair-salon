import Link from "next/link";
import Img from "@/components/Img";
import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import { AddButton, BagButton } from "@/components/shop/Cart";
import { q } from "@/lib/db";
import { money } from "@/lib/time";

export const metadata = { title: "Shop" };
type P = { slug: string; sku: string; brand: string; name: string; category: string; size: string; price_cents: number; image: string; stock: number };

export default async function Shop({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const all = await q<P>(`SELECT * FROM products ORDER BY id`);
  const filters = ["Hair Evolution", "Rusk", "Ekklesia", "Styling", "Treatments", "Care"];
  const list = f ? all.filter((p) => p.brand === f || p.category === f) : all;
  return (
    <>
      <PageHero eyebrow="Shop · Pickup in salon" tag={<FeatureTag id="shop" />} title={<>Take the chair <em>home.</em></>} lead="The lines Lee uses every day — Hair Evolution, Rusk and Ekklesia. Reserve online and pick up at your next visit." />
      <div className="container-x pb-28">
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <Link href="/shop" className={`chip ${!f ? "chip-on" : ""}`}>All</Link>
          {filters.map((x) => <Link key={x} href={`/shop?f=${encodeURIComponent(x)}`} className={`chip ${f === x ? "chip-on" : ""}`}>{x}</Link>)}
          <div className="ml-auto"><BagButton /></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {list.map((p) => (
            <div key={p.slug} className="group">
              <Link href={`/shop/${p.slug}`} className="block aspect-[4/5] rounded-[22px] overflow-hidden bg-cream relative">
                <Img src={p.image} alt={`${p.brand} ${p.name}`} className="h-full w-full group-hover:scale-105 transition duration-700" label={p.brand} />
                {p.stock <= 3 && <span className="absolute top-3 left-3 tag-price !bg-ivory">Only {p.stock} left</span>}
              </Link>
              <p className="mt-4 text-[11px] tracking-[0.02em] text-taupe">{p.brand} · {p.size}</p>
              <Link href={`/shop/${p.slug}`} className="font-display text-2xl hover:text-gold-deep">{p.name}</Link>
              <div className="flex items-center justify-between mt-2"><span className="font-display text-xl">{money(p.price_cents)}</span><AddButton p={{ slug: p.slug, name: p.name, brand: p.brand, price: p.price_cents }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-20 card p-10 bg-cream flex flex-col md:flex-row justify-between gap-6 md:items-center">
          <div><p className="font-display text-4xl">Prefer to give a gift?</p><p className="text-taupe mt-1">A Salon Ché gift card never expires.</p></div>
          <Link href="/gift-cards" className="btn-dark">Gift cards</Link>
        </div>
      </div>
    </>
  );
}
