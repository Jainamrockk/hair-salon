import Link from "next/link";
import PageHero from "@/components/PageHero";
import { CATEGORIES, SALON } from "@/lib/content";
import { getServices } from "@/lib/data";
import { fmtDuration, money } from "@/lib/time";

export const metadata = { title: "Services & prices" };

export default async function Services() {
  const services = await getServices();
  return (
    <>
      <PageHero eyebrow="Services" title={<>Services <em>&amp;</em> prices.</>} lead="Every price, up front. “And up” depends on hair length and how much color is needed — Lee will tell you the exact price before starting." />
      <div className="container-x grid lg:grid-cols-12 gap-12 pb-28">
        <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start">
          <p className="eyebrow mb-4">On this page</p>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}><a href={`#${c.id}`} className="flex items-center justify-between py-2 border-b border-sand hover:text-gold-deep">
                <span className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: c.hex }} />{c.name}</span>
                <span className="text-xs text-stone">{services.filter((s) => s.category === c.id).length}</span>
              </a></li>
            ))}
          </ul>
          <div className="card p-6 mt-8 bg-cream">
            <p className="font-display text-2xl">Not sure what you need?</p>
            <p className="text-sm text-taupe mt-2">Text Lee a photo of your hair and what you&apos;re after.</p>
            <a href={SALON.smsHref} className="btn-dark btn-sm mt-4">Text {SALON.phone}</a>
          </div>
        </aside>
        <div className="lg:col-span-9 space-y-20">
          {CATEGORIES.map((c) => {
            const list = services.filter((s) => s.category === c.id);
            return (
              <section key={c.id} id={c.id} className="scroll-mt-28">
                <div className="flex items-center gap-5 mb-6">
                  <div className="h-20 w-16 rounded-[14px] flex flex-col justify-between p-2 text-[9px] tracking-[0.02em] font-bold shadow" style={{ background: c.hex, color: c.ink }}><span>{c.shade}</span><span className="opacity-80">{c.shadeName}</span></div>
                  <div><h2 className="font-display text-5xl font-light">{c.name}</h2>{"note" in c && c.note ? <p className="font-display italic text-xl text-gold-deep">{c.note}</p> : null}</div>
                </div>
                <ul className="border-t border-sand">
                  {list.map((s) => (
                    <li key={s.id} className="group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_140px_auto] items-center gap-x-6 gap-y-1 py-5 border-b border-sand">
                      <div><p className="text-lg">{s.name}</p>{s.note ? <p className="text-sm text-taupe">{s.note}</p> : null}</div>
                      <p className="text-sm text-taupe md:text-right order-3 md:order-none">{fmtDuration(s.duration_min)}</p>
                      <p className="font-display text-2xl tabular-nums text-right">{money(s.price_cents)}<span className="text-xs font-sans text-taupe"> {s.price_label ?? ""}</span></p>
                      <Link href={`/book?s=${s.id}`} className="btn-ghost btn-sm order-4 md:order-none justify-self-end">Book</Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          <div className="rounded-[28px] plinth ring-1 ring-gold/20 text-noir p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-display text-5xl font-light">Ready when <em className="text-gold-light">you are.</em></h2>
            <div className="flex gap-3"><Link href="/book" className="btn-gold">Book an appointment</Link><a href={SALON.smsHref} className="btn-ghost">Text Lee</a></div>
          </div>
        </div>
      </div>
    </>
  );
}
