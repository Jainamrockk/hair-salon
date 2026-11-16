import Link from "next/link";
import Img from "@/components/Img";
import FeatureTag from "@/components/FeatureTag";
import Hero from "@/components/home/Hero";
import { Reveal, SplitWords } from "@/components/ui/reveal";
import { CATEGORIES, IMG, SALON, directionsUrl, mapEmbedUrl } from "@/lib/content";
import { getHours, getServices, getSite, nextOpenings } from "@/lib/data";
import { q } from "@/lib/db";
import { fmtDateStr, fmtMin, hhmmToMin, localDate, money, weekdayKey } from "@/lib/time";

const DAY_NAME: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
const VISITS = [
  { title: "Online, any hour", text: "Lee's real openings, day or night. No account, no password, no phone tag — booked in under a minute.", href: "/book", cta: "Book online", tag: "booking" },
  { title: "After hours", text: "Can't make it by seven? Evenings and early mornings by request. Lee replies personally by text.", href: "/book/request", cta: "Request a time", tag: "after-hours" },
  { title: "By text", text: "Send Lee a photo of your hair and what you're dreaming of. You'll get an honest answer and a price.", href: SALON.smsHref, cta: `Text ${SALON.phone}` },
];

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
  const menu = (cat: string, n = 5) => services.filter((s) => s.category === cat).slice(0, n);
  const ticker = [site.announcement, "Precision cuts", "Dimensional color", "Corrective color", "Perms & texture", "Keratin smoothing", "Men's grooming", "Botanical treatments"].filter(Boolean);

  return (
    <>
      <Hero title={site.heroTitle} lead={site.heroLead} image={IMG.chair} tag={<FeatureTag id="booking" />}
        openings={openings.map((o) => ({ href: `/book?date=${o.date}&t=${o.min}`, day: fmtDateStr(o.date, { weekday: "short", month: "short", day: "numeric" }), time: fmtMin(o.min) }))} />

      {/* Ticker, like the metal-price band on the flagship */}
      <div className="border-y border-noir/10 overflow-hidden py-4">
        <div className="flex w-max animate-marquee gap-14 whitespace-nowrap text-sm text-taupe">
          {[0, 1].flatMap((k) => ticker.map((t) => <span key={k + t} className="flex items-center gap-14">{t}<span className="text-gold-deep">◆</span></span>))}
        </div>
      </div>

      {/* The conviction, on the pearl wall */}
      <section className="theme-pearl">
        <div className="container-x grid gap-10 py-32 md:grid-cols-12 md:py-44">
          <Reveal className="md:col-span-9 md:col-start-3">
            <p className="font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.18]">“{SALON.quote}” Thirty-four years on, every guest still gets Lee&apos;s full attention — one chair, one person, no rush.</p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-4 md:col-start-3"><p className="text-taupe">Salon Ché moved from historic downtown Nampa to Almond Street in {SALON.movedYear}. Lee is a licensed cosmetology instructor and former TIGI ambassador.</p></Reveal>
        </div>

        {/* The colour rooms: one arched niche per family of the menu */}
        <div className="container-x pb-36">
          <div className="max-w-3xl">
            <Reveal><h2 className="h2">Every service, a shade of its own.</h2></Reveal>
            <SplitWords inView className="mt-6 text-lg text-taupe" text="The menu is arranged like a stylist's shade chart — the same colour codes Lee mixes from every day." />
          </div>
          <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 0.1}>
                <Link href={`/services#${c.id}`} className="group block">
                  <div className="niche relative aspect-[3/4] overflow-hidden transition-transform duration-700 ease-luxe group-hover:-translate-y-2" style={{ background: `radial-gradient(ellipse 70% 45% at 50% 30%, rgb(255 255 255 / .22), transparent 70%), linear-gradient(180deg, ${c.hex}, ${c.hex}dd 60%, #0b0807)` }}>
                    <span className="absolute inset-x-0 top-[18%] text-center font-display text-4xl md:text-5xl" style={{ color: c.ink, opacity: 0.85 }}>{c.shade}</span>
                    <span className="absolute inset-x-0 bottom-6 text-center text-xs tracking-[0.2em] uppercase" style={{ color: c.ink, opacity: 0.7 }}>{c.shadeName}</span>
                    <span className="absolute -inset-x-1/2 top-0 h-full w-1/3 -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1400ms] ease-luxe group-hover:translate-x-[400%]" />
                  </div>
                  <p className="mt-5 font-display text-2xl">{c.name}</p>
                  <p className="text-sm text-taupe">{from[c.id] ? `From ${money(from[c.id])}` : ""}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Prices, up front */}
      <section className="container-x py-32 md:py-40 grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <Reveal><h2 className="h2">Prices, up front.</h2></Reveal>
          <p className="lead mt-6">“And up” depends on length and how much colour is needed. Lee confirms the exact price before starting.</p>
          <Link href="/services" className="btn-dark mt-10">The full menu</Link>
        </div>
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-14 gap-y-16">
          {(["color", "cuts", "highlights", "him"] as const).map((cat, i) => { const c = CATEGORIES.find((x) => x.id === cat)!; return (
            <Reveal key={cat} delay={(i % 2) * 0.1}>
              <div className="flex items-center gap-3 text-sm text-stone"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.hex, boxShadow: "0 0 0 1px rgb(255 255 255 / .2)" }} />{c.shade} · {c.shadeName}</div>
              <h3 className="font-display text-4xl mt-3">{c.name}</h3>
              {"note" in c && c.note ? <p className="text-gold mt-1">{c.note}</p> : null}
              <ul className="mt-5">
                {menu(cat).map((s) => (
                  <li key={s.id} className="flex items-baseline gap-3 py-3 border-b border-noir/10">
                    <span className="flex-1 text-cocoa">{s.name}</span>
                    <span className="font-display text-2xl">{money(s.price_cents)}{s.price_label ? <span className="text-xs font-sans text-taupe"> {s.price_label}</span> : null}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/book?cat=${cat}`} className="link-arrow mt-6 text-noir">Book {c.name.toLowerCase()} <span aria-hidden>→</span></Link>
            </Reveal>
          ); })}
        </div>
      </section>

      {/* Meet Lee */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_60%_70%_at_30%_50%,#3a2418_0%,#0d0907_100%)]">
        <div className="container-x grid min-h-[90svh] items-center gap-14 py-28 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="relative mx-auto w-full max-w-[460px]">
            <div className="niche plinth overflow-hidden ring-1 ring-gold/20"><Img src={IMG.portrait} alt="Lee Ortivez at the chair" className="w-full aspect-[3/4] opacity-90" label="Lee Ortivez" /></div>
            <div className="absolute -bottom-6 -right-2 md:-right-8 glass rounded-full h-36 w-36 grid place-items-center text-center">
              <div><p className="font-display text-5xl leading-none text-gold-light">{SALON.years}</p><p className="text-[11px] text-taupe mt-1">years behind<br />the chair</p></div>
            </div>
          </Reveal>
          <div>
            <p className="text-taupe">Meet your stylist</p>
            <h2 className="mt-4 font-display text-[clamp(4rem,10vw,8.5rem)] leading-[0.85]">Lee Ortivez</h2>
            <p className="mt-8 max-w-[30em] text-lg leading-relaxed text-taupe">A teacher&apos;s eye for why a shape works, colour that grows out beautifully, and a chair that feels like catching up with an old friend.</p>
            <ul className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-[0.9375rem]">
              {SALON.credentials.map((c) => <li key={c} className="border-t border-noir/15 pt-3 text-cocoa">{c}</li>)}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3"><Link href="/about" className="btn-dark">Lee&apos;s story</Link><Link href="/work" className="btn-ghost">See the work</Link></div>
          </div>
        </div>
      </section>

      {/* Three ways to visit */}
      <section className="container-x py-32">
        <Reveal><h2 className="h2 max-w-2xl">Three ways in.</h2></Reveal>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-noir/10 bg-noir/10 md:grid-cols-3">
          {VISITS.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.12} className="bg-ivory p-10 md:p-12 flex flex-col">
              <span className="font-display text-6xl text-gold-deep/70">0{i + 1}</span>
              <h3 className="font-display text-4xl mt-6">{v.title}</h3>
              <p className="mt-4 text-taupe flex-1">{v.text}</p>
              <div className="mt-8 flex items-center justify-between gap-3"><Link href={v.href} className="link-arrow text-noir">{v.cta} <span aria-hidden>→</span></Link>{v.tag ? <FeatureTag id={v.tag} /> : null}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Work: the gallery of niches */}
      <section className="theme-pearl">
        <div className="container-x py-32 md:py-40">
          <div className="flex items-end justify-between gap-6"><Reveal><h2 className="h2">Fresh from the chair.</h2></Reveal><Link href="/work" className="link-arrow hidden sm:inline-flex">All work <span aria-hidden>→</span></Link></div>
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-5">
            {[[IMG.color, "All-over copper", "color"], [IMG.blonde, "Highlights", "highlights"], [IMG.barber, "Men's cut & beard", "him"], [IMG.curls, "Soft perm", "perms"], [IMG.styling, "Evening updo", "cuts"]].map(([src, t, cat], i) => (
              <Reveal key={t} delay={i * 0.08} className={i === 4 ? "hidden md:block" : ""}>
                <Link href={`/book?cat=${cat}`} className="group block">
                  <div className="niche overflow-hidden"><Img src={src} alt={t} className="w-full aspect-[3/4.4] transition-transform duration-[1200ms] ease-luxe group-hover:scale-105" /></div>
                  <p className="mt-4 font-display text-2xl">{t}</p>
                  <p className="text-sm text-taupe opacity-0 transition-opacity duration-500 group-hover:opacity-100">Book this look →</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* A single review, set like an inscription */}
        <div className="border-t border-noir/10">
          <div className="container-x py-32 grid md:grid-cols-12 gap-10">
            <div className="md:col-span-3"><p className="font-display text-7xl">4.9</p><p className="text-gold tracking-[0.3em] mt-2">★★★★★</p><p className="text-sm text-taupe mt-1">On Google</p><div className="mt-4"><FeatureTag id="reviews" /></div></div>
            <div className="md:col-span-9 space-y-14">
              {reviews.slice(0, 2).map((r, i) => (
                <Reveal key={r.id} delay={i * 0.15}>
                  <blockquote className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.2]">“{r.body}”</blockquote>
                  <p className="mt-4 text-taupe">{r.author} · {r.service}</p>
                </Reveal>
              ))}
              <Link href="/reviews" className="link-arrow">Read every review <span aria-hidden>→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Try-on and gift card, two vitrines */}
      <section className="container-x py-32 grid lg:grid-cols-2 gap-6">
        <Reveal className="rounded-[28px] plinth p-10 md:p-14 min-h-[520px] flex flex-col overflow-hidden relative">
          <div className="flex justify-between items-start"><p className="text-taupe">Virtual try-on</p><FeatureTag id="try-on" /></div>
          <h3 className="font-display text-5xl mt-6 max-w-sm">See the shade before the chair.</h3>
          <p className="mt-4 text-taupe max-w-sm">Upload a selfie, tap your hair, and preview copper, honey or espresso — then book that exact colour.</p>
          <div className="mt-auto flex items-end gap-2 pt-10">{CATEGORIES.slice(0, 7).map((c, i) => <span key={c.id} className="flex-1 rounded-t-full animate-float" style={{ background: c.hex, height: 70 + i * 14, animationDelay: `${i * 0.3}s`, boxShadow: "inset 0 1px 0 rgb(255 255 255 / .15)" }} />)}</div>
          <Link href="/try-on" className="btn-dark mt-8 self-start">Try a colour</Link>
        </Reveal>
        <Reveal delay={0.12} className="rounded-[28px] plinth p-10 md:p-14 min-h-[520px] flex flex-col">
          <div className="flex justify-between items-start"><p className="text-taupe">Gift cards</p><FeatureTag id="gift-cards" /></div>
          <h3 className="font-display text-5xl mt-6 max-w-sm">Give a good hair day.</h3>
          <div className="my-auto py-10 grid place-items-center">
            <div className="w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br from-[#2a211c] via-[#3b2c22] to-[#7a5d37] p-7 flex flex-col justify-between shadow-soft rotate-[-4deg] ring-1 ring-gold/30 animate-float">
              <span className="font-display tracking-[0.3em] uppercase text-[#f0e6d6]">Salon Ché</span>
              <span className="font-display text-6xl text-[#f0e6d6]">$50</span>
            </div>
          </div>
          <Link href="/gift-cards" className="btn-dark self-start">Send a gift card</Link>
        </Reveal>
      </section>

      {/* The shelf */}
      <section className="theme-pearl">
        <div className="container-x py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div><Reveal><h2 className="h2">Take the chair home.</h2></Reveal><p className="mt-5 text-taupe max-w-lg">{SALON.brands.join(", ")} — the lines Lee uses every day. Reserve online, collect at your visit.</p></div>
            <div className="flex items-center gap-4"><FeatureTag id="shop" /><Link href="/shop" className="btn-dark">The shop</Link></div>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/shop/${p.slug}`} className="group block">
                  <div className="niche plinth overflow-hidden"><Img src={p.image} alt={`${p.brand} ${p.name}`} className="w-full aspect-[3/4] transition-transform duration-[1200ms] ease-luxe group-hover:scale-105" label={p.brand} /></div>
                  <p className="mt-5 text-sm text-taupe">{p.brand}</p>
                  <div className="flex justify-between gap-2"><p className="font-display text-2xl">{p.name}</p><p className="font-display text-2xl">{money(p.price_cents)}</p></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="container-x py-32 grid lg:grid-cols-2 gap-14">
        <div>
          <Reveal><h2 className="h2">{SALON.street}, Nampa.</h2></Reveal>
          <p className="mt-4 text-taupe">Free parking out front · street-level entrance</p>
          <ul className="mt-12 border-t border-noir/10">
            {order.map((d) => { const h = (hours as any)[d]; return (
              <li key={d} className={`flex justify-between py-3.5 border-b border-noir/10 ${d === today ? "text-noir" : "text-taupe"}`}>
                <span className="flex items-center gap-3">{DAY_NAME[d]}{d === today && <span className="tag-price">Today</span>}</span>
                <span>{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span>
              </li>
            ); })}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-dark">Directions</a>
            <a href={SALON.phoneHref} className="btn-ghost">Call</a><a href={SALON.smsHref} className="btn-ghost">Text</a>
          </div>
        </div>
        <Reveal className="niche overflow-hidden min-h-[520px] ring-1 ring-noir/10">
          <iframe title="Map to Salon Ché" src={mapEmbedUrl} className="h-full w-full min-h-[520px] grayscale invert-[.92] hue-rotate-180 contrast-[.9]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Reveal>
      </section>
    </>
  );
}
