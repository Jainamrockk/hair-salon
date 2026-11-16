import Link from "next/link";
import Img from "@/components/Img";
import ShadeStrip from "@/components/ShadeStrip";
import FeatureTag from "@/components/FeatureTag";
import { CATEGORIES, IMG, SALON, directionsUrl, mapEmbedUrl } from "@/lib/content";
import { getHours, getServices, getSite, nextOpenings } from "@/lib/data";
import { q } from "@/lib/db";
import { fmtDateStr, fmtMin, hhmmToMin, localDate, money, weekdayKey } from "@/lib/time";

export default async function Home() {
  const [site, services, openings, hours, reviews, products] = await Promise.all([
    getSite(), getServices(), nextOpenings(3), getHours(),
    q<{ id: number; author: string; rating: number; body: string; service: string }>(`SELECT * FROM reviews ORDER BY rating DESC, created_at DESC LIMIT 3`),
    q<{ slug: string; brand: string; name: string; price_cents: number; image: string }>(`SELECT slug, brand, name, price_cents, image FROM products ORDER BY id LIMIT 4`),
  ]);
  const from: Record<string, number> = {};
  for (const s of services) from[s.category] = Math.min(from[s.category] ?? 1e9, s.price_cents);
  const today = weekdayKey(localDate());
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const highlight = (cat: string, n = 5) => services.filter((s) => s.category === cat).slice(0, n);

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-[76px] min-h-[100svh] bg-noir text-ivory overflow-hidden grain">
        <Img src={IMG.hero} alt="Inside Salon Ché — warm light over the styling chair" className="absolute inset-0 h-full w-full opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-noir/30" />
        <div className="relative container-x min-h-[100svh] flex flex-col justify-end pb-14 pt-40">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow-gold mb-6 animate-rise">Hair · Color · Barber — {SALON.area}</p>
              <h1 className="h-display text-[18vw] md:text-[150px] lg:text-[176px] animate-rise" style={{ animationDelay: "80ms" }}>
                {site.heroTitle.replace(/\.$/, "").split(" ").slice(0, -1).join(" ")} <em className="text-gold-light">{site.heroTitle.replace(/\.$/, "").split(" ").at(-1)}.</em>
              </h1>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-ivory/80 font-light leading-relaxed animate-rise" style={{ animationDelay: "160ms" }}>{site.heroLead}</p>
              <div className="mt-10 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "240ms" }}>
                <Link href="/book" className="btn-gold">Book an appointment</Link>
                <Link href="/services" className="btn-ghost-light">Services & prices</Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.16em] text-ivory/60">
                <li>✦ No account needed</li><li>✦ Text reminders</li><li>✦ After-hours by request</li>
              </ul>
            </div>
            <aside className="lg:col-span-4 rounded-[26px] bg-ivory/10 backdrop-blur-xl border border-ivory/15 p-6 animate-rise" style={{ animationDelay: "320ms" }}>
              <div className="flex items-center justify-between">
                <p className="eyebrow !text-ivory/70">Next open with Lee</p>
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />Live</span>
              </div>
              <ul className="mt-4 divide-y divide-ivory/10">
                {openings.length ? openings.map((o) => (
                  <li key={o.date + o.min}>
                    <Link href={`/book?date=${o.date}`} className="flex justify-between py-3.5 hover:text-gold-light">
                      <span>{fmtDateStr(o.date, { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span className="font-display text-2xl">{fmtMin(o.min)}</span>
                    </Link>
                  </li>
                )) : <li className="py-4 text-ivory/70">Fully booked — join the waitlist.</li>}
              </ul>
              <div className="mt-3 flex items-center justify-between"><Link href="/book" className="link-arrow text-gold-light">See all times →</Link><FeatureTag id="booking" /></div>
            </aside>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-cream border-y border-sand overflow-hidden py-5">
        <div className="flex w-max animate-marquee gap-12 font-display italic text-3xl text-cocoa/70 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Precision cuts", "Dimensional color", "Corrective color", "Perms & texture", "Keratin smoothing", "Botanical treatments", "Men's grooming", "Waxing"].map((t) => <span key={k + t}>{t} <span className="text-gold not-italic">✦</span></span>))}
        </div>
      </div>

      {/* COLOR BAR */}
      <section className="container-x py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div><p className="eyebrow-gold mb-4">The colour bar</p><h2 className="h2 max-w-2xl">Every service, a shade of its own.</h2></div>
          <p className="max-w-sm text-taupe">Our menu is organised like a stylist&apos;s shade chart — the same codes Lee mixes from every day. Pick a swatch to see prices.</p>
        </div>
        <ShadeStrip from={from} />
      </section>

      {/* SERVICES PREVIEW */}
      <section className="bg-white/60 border-y border-sand">
        <div className="container-x py-24 md:py-32 grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p className="eyebrow-gold mb-4">Services</p>
            <h2 className="h2">Prices, up front.</h2>
            <p className="lead mt-6">“And up” depends on length and how much color is needed. Lee confirms the exact price before starting.</p>
            <Link href="/services" className="btn-dark mt-8">Full menu & every price</Link>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-12 gap-y-14">
            {(["color", "cuts", "him", "waxing"] as const).map((cat) => { const c = CATEGORIES.find((x) => x.id === cat)!; return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-5"><span className="h-3.5 w-3.5 rounded-full ring-2 ring-white shadow" style={{ background: c.hex }} /><span className="text-[11px] uppercase tracking-luxe text-taupe">{c.shade} · {c.shadeName}</span></div>
                <h3 className="h3 mb-2">{c.name}</h3>
                {"note" in c && c.note ? <p className="text-sm text-gold-deep mb-4 italic font-display text-lg">{c.note}</p> : null}
                <ul className="divide-y divide-sand">
                  {highlight(cat).map((s) => (
                    <li key={s.id} className="flex items-baseline gap-3 py-3">
                      <span className="flex-1">{s.name}</span>
                      <span className="font-display text-xl tabular-nums">{money(s.price_cents)}{s.price_label ? <span className="text-xs font-sans text-taupe"> {s.price_label}</span> : null}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/book?cat=${cat}`} className="link-arrow mt-5 text-noir">Book {c.name.toLowerCase()} →</Link>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* HOW BOOKING WORKS */}
      <section className="container-x py-24 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16"><p className="eyebrow-gold mb-4">How booking works</p><h2 className="h2">Booked in a minute.<br /><em>Changed by text.</em></h2></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[["01", "Pick a service and a time", "See Lee's real openings, day or night. No account, no password, no phone tag.", "booking"],
            ["02", "Get a text", "A confirmation right away, a reminder two days before and another two hours before.", "sms"],
            ["03", "Change plans by text", "Tap the link in any text to reschedule or cancel. Running late? Tell Lee in one tap.", "accounts"]].map(([n, t, d, f]) => (
            <div key={n} className="card p-8 md:p-10 relative">
              <span className="font-display text-7xl text-gold/40 font-light">{n}</span>
              <h3 className="h3 mt-4">{t}</h3>
              <p className="mt-3 text-taupe leading-relaxed">{d}</p>
              <div className="mt-6"><FeatureTag id={f} /></div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book" className="btn-dark">Book an appointment</Link>
          <a href={SALON.smsHref} className="btn-ghost">Rather talk? Text {SALON.phone}</a>
        </div>
      </section>

      {/* MEET LEE */}
      <section className="bg-noir text-ivory grain relative overflow-hidden">
        <div className="container-x py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <Img src={IMG.portrait} alt="Lee Ortivez at the chair" className="w-full aspect-[4/5] rounded-[28px]" label="Lee Ortivez" />
            <div className="absolute -bottom-8 -right-4 md:-right-10 bg-gold text-white rounded-full h-36 w-36 grid place-items-center text-center shadow-soft">
              <div><p className="font-display text-5xl leading-none">{SALON.years}</p><p className="text-[10px] uppercase tracking-[0.2em] mt-1">years behind<br />the chair</p></div>
            </div>
          </div>
          <div>
            <p className="eyebrow-gold mb-4">Meet your stylist</p>
            <h2 className="h2">Lee Ortivez.</h2>
            <blockquote className="mt-8 font-display italic text-3xl md:text-4xl text-gold-light leading-snug">“{SALON.quote}”</blockquote>
            <p className="mt-8 text-ivory/70 leading-relaxed text-lg font-light">Lee has been a professional hairdresser for {SALON.years} years and is a licensed cosmetology instructor. Salon Ché moved from historic downtown Nampa to Almond Street in {SALON.movedYear} — one stylist, one guest at a time.</p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
              {SALON.credentials.map((c) => <li key={c} className="flex gap-3 border-t border-ivory/15 pt-3"><span className="text-gold">✦</span>{c}</li>)}
            </ul>
            <Link href="/about" className="btn-ghost-light mt-10">Read Lee&apos;s story</Link>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section className="container-x py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 gap-6"><div><p className="eyebrow-gold mb-4">Work</p><h2 className="h2">Fresh from the chair.</h2></div><Link href="/work" className="link-arrow hidden sm:inline-flex">See all work →</Link></div>
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[640px]">
          {[[IMG.color, "Dimensional color", "md:col-span-2 md:row-span-2"], [IMG.blonde, "Highlights", ""], [IMG.barber, "Men's cut & beard", ""], [IMG.curls, "Soft perm", ""], [IMG.styling, "Updo & style", ""]].map(([src, t, cls]) => (
            <Link href="/work" key={t} className={`group relative overflow-hidden rounded-[22px] aspect-square md:aspect-auto ${cls}`}>
              <Img src={src} alt={t} className="h-full w-full transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-ivory"><span className="font-display text-2xl">{t}</span><span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">Book this look →</span></div>
            </Link>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-cream border-y border-sand">
        <div className="container-x py-24 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><p className="eyebrow-gold mb-4">Reviews</p><h2 className="h2">What clients say.</h2></div>
            <div className="flex items-center gap-4"><span className="font-display text-6xl">4.9</span><div><p className="text-gold text-lg tracking-widest">★★★★★</p><p className="text-xs text-taupe uppercase tracking-widest">on Google</p></div><FeatureTag id="reviews" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <figure key={r.id} className="card p-8 bg-ivory">
                <p className="text-gold tracking-widest">{"★".repeat(r.rating)}</p>
                <blockquote className="mt-4 font-display text-2xl leading-snug">“{r.body}”</blockquote>
                <figcaption className="mt-6 text-sm text-taupe"><span className="text-noir font-semibold">{r.author}</span> · {r.service}</figcaption>
              </figure>
            ))}
          </div>
          <Link href="/reviews" className="link-arrow mt-10">Read all reviews →</Link>
        </div>
      </section>

      {/* AFTER HOURS + GIFT + TRY-ON */}
      <section className="container-x py-24 md:py-32 grid lg:grid-cols-3 gap-6">
        <div className="card p-10 bg-noir text-ivory border-noir flex flex-col">
          <div className="flex justify-between items-start"><p className="eyebrow-gold">After hours</p><FeatureTag id="after-hours" /></div>
          <h3 className="font-display text-4xl mt-6 font-light">Can&apos;t make it by 7? <em className="text-gold-light">Ask.</em></h3>
          <p className="mt-4 text-ivory/70 flex-1">Evenings and early mornings, by appointment. Send a request and Lee replies by text.</p>
          <Link href="/book/request" className="btn-ghost-light mt-8 self-start">Request a time</Link>
        </div>
        <div className="card p-10 flex flex-col">
          <div className="flex justify-between items-start"><p className="eyebrow-gold">Gift cards</p><FeatureTag id="gift-cards" /></div>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-noir via-cocoa to-gold-deep p-6 text-ivory aspect-[1.6/1] flex flex-col justify-between shadow-soft rotate-[-2deg]">
            <span className="font-display text-2xl">Salon <em>Ché</em></span><span className="font-display text-5xl">$50</span>
          </div>
          <h3 className="font-display text-3xl mt-8 font-light">Give a little shine.</h3>
          <p className="mt-2 text-taupe flex-1">Digital gift cards by email in two taps. Any amount. Never expire.</p>
          <Link href="/gift-cards" className="btn-dark mt-6 self-start">Send a gift card</Link>
        </div>
        <div className="card p-10 flex flex-col overflow-hidden relative">
          <div className="flex justify-between items-start"><p className="eyebrow-gold">Virtual try-on</p><FeatureTag id="try-on" /></div>
          <h3 className="font-display text-3xl mt-6 font-light">See the shade before the chair.</h3>
          <p className="mt-2 text-taupe">Upload a selfie, preview copper, honey or espresso, and book that exact color.</p>
          <div className="flex gap-2 mt-6 flex-1 items-end">{CATEGORIES.slice(0, 6).map((c) => <span key={c.id} className="h-16 flex-1 rounded-t-full" style={{ background: c.hex }} />)}</div>
          <Link href="/try-on" className="btn-ghost mt-6 self-start">Try a color</Link>
        </div>
      </section>

      {/* SHOP */}
      <section className="bg-white/60 border-y border-sand">
        <div className="container-x py-24 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><p className="eyebrow-gold mb-4">Shop</p><h2 className="h2">Take the shine home.</h2><p className="mt-4 text-taupe max-w-lg">{SALON.brands.join(", ")} — the lines Lee uses every day. Reserve online and pick up at your visit.</p></div>
            <div className="flex items-center gap-4"><FeatureTag id="shop" /><Link href="/shop" className="btn-dark">Shop products</Link></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link key={p.slug} href={`/shop/${p.slug}`} className="group">
                <div className="aspect-[4/5] rounded-[20px] overflow-hidden bg-cream"><Img src={p.image} alt={`${p.brand} ${p.name}`} className="h-full w-full group-hover:scale-105 transition duration-700" label={p.brand} /></div>
                <p className="mt-4 text-[11px] uppercase tracking-luxe text-taupe">{p.brand}</p>
                <div className="flex justify-between gap-2"><p className="font-display text-xl">{p.name}</p><p className="font-display text-xl">{money(p.price_cents)}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="container-x py-24 md:py-32 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="eyebrow-gold mb-4">Visit</p>
          <h2 className="h2">{SALON.street},<br /><em>Nampa.</em></h2>
          <p className="mt-4 text-taupe">Free parking out front · street-level entrance</p>
          <ul className="mt-10 divide-y divide-sand border-y border-sand">
            {order.map((d) => { const h = (hours as any)[d]; return (
              <li key={d} className={`flex justify-between py-3.5 ${d === today ? "font-semibold" : ""}`}>
                <span className="capitalize flex items-center gap-3">{({ mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" } as any)[d]}{d === today && <span className="tag-price !bg-noir !text-ivory !border-noir">Today</span>}</span>
                <span className="tabular-nums">{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span>
              </li>
            ); })}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-dark">Get directions</a>
            <a href={SALON.phoneHref} className="btn-ghost">Call</a>
            <a href={SALON.smsHref} className="btn-ghost">Text</a>
          </div>
        </div>
        <div className="rounded-[28px] overflow-hidden border border-sand min-h-[420px] bg-cream">
          <iframe title="Map to Salon Ché" src={mapEmbedUrl} className="h-full w-full min-h-[420px] grayscale-[60%] contrast-[1.05]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </>
  );
}
