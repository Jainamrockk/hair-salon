import Link from "next/link";
import PageHero from "@/components/PageHero";
import { BASE_PACKAGE, FEATURES } from "@/lib/features";

export const metadata = { title: "Features & pricing", robots: { index: false } };
const GROUP_TITLE = { Clients: "Client experience", Revenue: "Revenue", Owner: "Owner tools", Smart: "Smart & AI" } as const;

export default function FeaturesPage() {
  const groups = ["Clients", "Revenue", "Owner", "Smart"] as const;
  const total = FEATURES.reduce((a, f) => a + f.price, 0);
  return (
    <>
      <PageHero eyebrow="Proposal for Salon Ché" title={<>Features <em>&amp; pricing.</em></>} lead="The premium base website is one price. Every feature after that is an add-on, tagged on the site with its cost — pick only what you want." />
      <div className="container-x pb-28">
        <div className="rounded-[28px] bg-noir text-ivory p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <p className="eyebrow-gold">Included</p>
            <h2 className="font-display text-5xl font-light mt-3">{BASE_PACKAGE.name}</h2>
            <ul className="mt-6 space-y-2 text-ivory/75">{BASE_PACKAGE.includes.map((x) => <li key={x} className="flex gap-3"><span className="text-gold">✦</span>{x}</li>)}</ul>
          </div>
          <p className="font-display text-7xl text-gold-light">${BASE_PACKAGE.price.toLocaleString()}</p>
        </div>
        {groups.map((g) => (
          <section key={g} className="mt-16">
            <h2 className="font-display text-4xl font-light mb-6">{GROUP_TITLE[g]}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {FEATURES.filter((f) => f.group === g).map((f) => (
                <div key={f.id} id={f.id} className="card p-7 scroll-mt-28 target:ring-2 target:ring-gold">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-3xl">{f.name}</h3>
                    <span className="tag-price !text-xs !px-3">+ ${f.price}</span>
                  </div>
                  <p className="text-taupe mt-3">{f.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    {f.where.map((w) => w.startsWith("/") ? <Link key={w} href={w} className="chip !py-1 !px-3 !text-xs">{w}</Link> : <span key={w} className="chip !py-1 !px-3 !text-xs">{w}</span>)}
                    {f.monthly ? <span className="text-stone ml-auto">Running cost: {f.monthly}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="mt-16 card p-8 bg-cream flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <p className="text-lg">All add-ons together: <span className="font-display text-3xl">${total.toLocaleString()}</span> <span className="text-taupe">+ base ${BASE_PACKAGE.price.toLocaleString()}</span></p>
          <p className="text-sm text-taupe">Hide these tags on the live site with <code>NEXT_PUBLIC_SHOW_PRICE_TAGS=false</code>.</p>
        </div>
      </div>
    </>
  );
}
