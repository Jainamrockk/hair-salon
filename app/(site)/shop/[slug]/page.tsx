import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import { AddButton, BagButton } from "@/components/shop/Cart";
import { one, q } from "@/lib/db";
import { money } from "@/lib/time";

type P = { slug: string; sku: string; brand: string; name: string; category: string; size: string; price_cents: number; image: string; stock: number; description: string; how_to: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await one<P>(`SELECT * FROM products WHERE slug = $1`, [slug]);
  return { title: p ? `${p.brand} ${p.name}` : "Product" };
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await one<P>(`SELECT * FROM products WHERE slug = $1`, [slug]);
  if (!p) notFound();
  const more = await q<P>(`SELECT * FROM products WHERE slug <> $1 ORDER BY (brand = $2) DESC, id LIMIT 3`, [slug, p.brand]);
  return (
    <div className="container-x py-12 md:py-16">
      <div className="flex justify-between items-center mb-8"><Link href="/shop" className="text-sm text-taupe hover:text-noir">← Shop</Link><BagButton /></div>
      <div className="grid lg:grid-cols-2 gap-14">
        <div className="aspect-[4/5] rounded-[30px] overflow-hidden bg-cream"><Img src={p.image} alt={`${p.brand} ${p.name}`} className="h-full w-full" label={p.brand} /></div>
        <div className="lg:py-10">
          <p className="eyebrow-gold">{p.brand} · {p.sku}</p>
          <h1 className="h1 mt-4">{p.name}</h1>
          <p className="font-display text-4xl mt-6">{money(p.price_cents)} <span className="text-base font-sans text-taupe">· {p.size}</span></p>
          <p className="lead mt-6">{p.description}</p>
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <AddButton p={{ slug: p.slug, name: p.name, brand: p.brand, price: p.price_cents }} className="btn-dark" />
            <span className={`text-sm ${p.stock > 3 ? "text-emerald-500" : "text-amber-700"}`}>{p.stock > 0 ? `${p.stock} in stock at the salon` : "Out of stock — reserve and Lee will order it"}</span>
          </div>
          <div className="mt-10 border-t border-sand pt-6 space-y-6">
            <div><p className="eyebrow mb-2">How to use</p><p className="text-cocoa/90">{p.how_to}</p></div>
            <div><p className="eyebrow mb-2">Pickup</p><p className="text-cocoa/90">Reserve online and collect at 507 Almond Street during opening hours or at your next visit. Pay at pickup.</p></div>
            <div className="rounded-2xl bg-cream p-5"><p className="font-display text-xl">Lee&apos;s tip</p><p className="text-sm text-taupe mt-1">Ask at your next visit which product suits your hair — Lee will happily match it to your color and texture.</p></div>
          </div>
        </div>
      </div>
      <section className="mt-24">
        <h2 className="font-display text-4xl font-light mb-8">Pairs well with</h2>
        <div className="grid sm:grid-cols-3 gap-5">{more.map((m) => (
          <Link key={m.slug} href={`/shop/${m.slug}`} className="group">
            <div className="aspect-[4/3] rounded-[20px] overflow-hidden bg-cream"><Img src={m.image} alt={m.name} className="h-full w-full group-hover:scale-105 transition duration-700" label={m.brand} /></div>
            <p className="mt-3 text-xs tracking-[0.02em] text-taupe">{m.brand}</p><p className="font-display text-2xl">{m.name} · {money(m.price_cents)}</p>
          </Link>
        ))}</div>
      </section>
    </div>
  );
}
