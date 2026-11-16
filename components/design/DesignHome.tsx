import Link from "next/link";
import Img from "@/components/Img";
import FeatureTag from "@/components/FeatureTag";
import Wordmark from "./Wordmark";
import { DAY_LABEL, SALON, directionsUrl, mapEmbedUrl } from "@/lib/content";
import { fmtMin, hhmmToMin, money } from "@/lib/time";
import type { GalleryItem } from "@/lib/photos";

// The shade chart exactly as drawn in the design file's Foundations page.
const CHIPS = [
  { id: "cuts", code: "1N", name: "Soft black", label: "Cuts", bg: "#15130F", ink: "#FFFFFF" },
  { id: "him", code: "3N", name: "Espresso", label: "For him", bg: "#33241C", ink: "#FFFFFF" },
  { id: "color", code: "6RR", name: "Cherry", label: "Color", bg: "#C8102E", ink: "#FFFFFF" },
  { id: "highlights", code: "8G", name: "Honey", label: "Highlights", bg: "#DDA94B", ink: "#15130F" },
  { id: "perms", code: "7C", name: "Copper", label: "Perms", bg: "#B4541F", ink: "#FFFFFF" },
  { id: "smoothing", code: "5N", name: "Chestnut", label: "Smoothing", bg: "#6F4630", ink: "#FFFFFF" },
  { id: "treatments", code: "9A", name: "Ash", label: "Treatments", bg: "#BDB5A6", ink: "#15130F" },
  { id: "waxing", code: "10P", name: "Platinum", label: "Waxing", bg: "#ECE7DC", ink: "#15130F" },
];
const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase";
const eyebrow = "font-mono text-[12px] font-medium tracking-[0.08em] uppercase text-[#C8102E]";
const h2 = "font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] tracking-[-0.02em] text-[#15130F]";
const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const ArrowLink = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="group inline-flex items-center gap-2 min-h-[44px] font-semibold text-[#15130F] hover:text-[#C8102E]">{children}<Arrow /></Link>;

type Svc = { id: number; category: string; name: string; price_cents: number; price_label: string | null };
type Props = {
  title: string; lead: string; photos: Record<string, string>; work: GalleryItem[];
  openings: { href: string; day: string; time: string }[]; services: Svc[];
  reviews: { id: number; author: string; rating: number; body: string; service: string }[];
  products: { slug: string; brand: string; name: string; price_cents: number; image: string }[];
  hours: Record<string, { open: string; close: string } | null>; today: string;
};

export default function DesignHome({ title, lead, photos, work, openings, services, reviews, products, hours, today }: Props) {
  const from: Record<string, number> = {};
  for (const s of services) from[s.category] = Math.min(from[s.category] ?? 1e9, s.price_cents);
  const pick = (cat: string, n: number) => services.filter((s) => s.category === cat).slice(0, n);
  const price = (s: Svc) => `${s.price_label === "and up" ? "From " : ""}${money(s.price_cents)}${s.price_label && s.price_label !== "and up" ? ` ${s.price_label}` : ""}`;
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  return (
    <div className="bg-white text-[#3A3732]">
      {/* HERO */}
      <section className="pt-12">
        <div className="container-x">
          <div className="flex items-center justify-between gap-4"><span className={eyebrow}>Hair · Color · Barber</span><span className={`${mono} !text-[12px] text-[#67635B]`}>{SALON.area}</span></div>
          <h1 className="d-rise font-display d-heavy mt-5 mb-14 -ml-1 text-[clamp(4.5rem,18vw,16.5rem)] leading-[0.86] text-[#15130F]">{title}</h1>
          <div className="grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-24 items-stretch">
            <div className="flex flex-col justify-between gap-8">
              <p className="d-rise text-[22px] leading-[1.5] text-[#3A3732] max-w-[480px]" style={{ animationDelay: "160ms" }}>{lead}</p>
              <div className="d-rise space-y-6" style={{ animationDelay: "240ms" }}>
                <div className="flex flex-wrap gap-3"><Link href="/book" className="btn-dark">Book an appointment</Link><Link href="/services" className="btn-ghost">See services and prices</Link></div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium text-[#15130F]">
                  {["No account needed", "Text reminders", "After-hours slots"].map((t) => <li key={t} className="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7A46" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>{t}</li>)}
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="d-rise relative overflow-hidden rounded-[28px] aspect-[4/3] bg-[#ECE7DC]" style={{ animationDelay: "200ms" }}>
                <Img src={photos.hero2} alt="Lee finishing a colour at the chair" className="h-full w-full" />
              </div>
              <div className="d-rise lg:absolute lg:-left-14 lg:bottom-10 mt-6 lg:mt-0 w-full lg:w-[340px] rounded-[20px] bg-white p-5 shadow-[0_2px_6px_rgba(21,19,15,.06),0_16px_40px_rgba(21,19,15,.10)]" style={{ animationDelay: "320ms" }}>
                <div className="flex items-center justify-between"><span className={`${mono} text-[#67635B]`}>Next open with Lee</span><span className={`${mono} flex items-center gap-1.5 text-[#1E7A46]`}><span className="h-2 w-2 rounded-full bg-[#1E7A46]" />Live</span></div>
                <div className="mt-3 flex flex-col gap-2">
                  {openings.length ? openings.map((o) => (
                    <Link key={o.href} href={o.href} className="group flex items-center justify-between h-[52px] px-4 rounded-[14px] border-[1.5px] border-[#DDDAD3] hover:border-[#15130F] transition-colors">
                      <span className="text-[15px] font-medium text-[#3A3732]">{o.day}</span><span className="flex items-center gap-2 font-semibold tabular-nums text-[#15130F]">{o.time}<Arrow /></span>
                    </Link>
                  )) : <p className="text-sm">Fully booked — <Link href="/book/waitlist" className="underline">join the waitlist</Link>.</p>}
                </div>
                <div className="mt-1 flex items-center justify-between"><ArrowLink href="/book">See all times</ArrowLink><FeatureTag id="booking" /></div>
              </div>
            </div>
          </div>
          {/* the shade chart doubles as the service menu */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CHIPS.map((c, i) => (
              <Link key={c.code} href={`/services#${c.id}`} className="d-rise d-lift flex flex-col justify-between h-[132px] md:h-[176px] p-4 rounded-[10px]"
                style={{ background: c.bg, color: c.ink, animationDelay: `${400 + i * 60}ms`, boxShadow: c.id === "waxing" ? "inset 0 0 0 1px #DDDAD3" : undefined }}>
                <div className={`${mono} flex justify-between`}><span>{c.code}</span><span>{c.name}</span></div>
                <div><span className="block font-display text-[22px] leading-[1.15] tracking-[-0.015em]">{c.label}</span><span className={mono}>{from[c.id] ? `From ${money(from[c.id])}` : ""}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-28">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"><div><span className={eyebrow}>Services</span><h2 className={`${h2} mt-4`}>Prices up front.</h2></div><ArrowLink href="/services">Full menu and every price</ArrowLink></div>
          <div className="grid lg:grid-cols-[5fr_4fr_3fr] gap-6">
            <div className="lg:row-span-2 rounded-[28px] bg-[#C8102E] text-white p-10 flex flex-col justify-between gap-8">
              <div>
                <div className={`${mono} flex items-center gap-2`}><span className="h-3 w-3 rounded-[4px] bg-white" />6RR · Cherry</div>
                <p className="font-display text-[44px] leading-none mt-4">Color</p>
                <p className="font-display text-[64px] leading-none mt-2">{money(services.find((s) => s.name === "Color")?.price_cents ?? from.color ?? 7500)}</p>
                <p className="mt-4 text-white/85 max-w-sm">A complimentary haircut comes with every full-service color.</p>
              </div>
              <ul className="divide-y divide-white/20 border-t border-white/20">
                {pick("color", 5).filter((s) => s.name !== "Color").slice(0, 4).map((s) => <li key={s.id} className="flex justify-between py-3"><span>{s.name}</span><span className="font-semibold tabular-nums">{price(s)}</span></li>)}
              </ul>
              <Link href="/book?cat=color" className="btn self-start bg-white text-[#15130F] hover:bg-[#15130F] hover:text-white">Book color</Link>
            </div>
            {[["cuts", "1N · Soft black", "Cuts for her", "#15130F"], ["him", "3N · Espresso", "For him", "#33241C"], ["waxing", "10P · Platinum", "Waxing and care", "#ECE7DC"], ["highlights", "8G · Honey", "Highlights", "#DDA94B"]].map(([cat, code, name, hex]) => (
              <div key={cat} className="rounded-[20px] border border-[#DDDAD3] p-7">
                <div className={`${mono} flex items-center gap-2 text-[#67635B]`}><span className="h-3 w-3 rounded-[4px]" style={{ background: hex, boxShadow: "inset 0 0 0 1px #8F8A80" }} />{code}</div>
                <p className="font-display text-[28px] leading-tight mt-3 text-[#15130F]">{name}</p>
                <ul className="mt-4 divide-y divide-[#DDDAD3]">{pick(cat === "waxing" ? "waxing" : cat, 4).map((s) => <li key={s.id} className="flex justify-between gap-3 py-2.5 text-[15px]"><span>{s.name}</span><span className="font-semibold tabular-nums text-[#15130F]">{price(s)}</span></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW BOOKING WORKS */}
      <section className="py-28 bg-[#F5F4F1]">
        <div className="container-x">
          <span className={eyebrow}>How booking works</span>
          <h2 className={`${h2} mt-4 max-w-2xl`}>Booked in a minute. Changed by text.</h2>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[["01", "Pick a service and a time", "See Lee's real openings, day or night. No account, no password, no phone tag.", "booking"], ["02", "Get a text", "A confirmation right away, a reminder two days before and another two hours before.", "sms"], ["03", "Change plans by text", "Tap the link in any text to reschedule or cancel. Running late? Tell Lee in one tap.", "accounts"]].map(([n, t, d, f]) => (
              <div key={n} className="rounded-[20px] bg-white p-8 shadow-[0_1px_2px_rgba(21,19,15,.06),0_1px_1px_rgba(21,19,15,.04)]">
                <span className="font-display d-heavy text-[56px] leading-none text-[#C8102E]">{n}</span>
                <p className="font-display text-[24px] mt-6 text-[#15130F]">{t}</p>
                <p className="mt-3">{d}</p>
                <div className="mt-6"><FeatureTag id={f} /></div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-6"><Link href="/book" className="btn-dark">Book an appointment</Link><span>Rather talk? <a href={SALON.phoneHref} className="font-semibold text-[#15130F] underline underline-offset-4">Call or text {SALON.phone}</a></span></div>
        </div>
      </section>

      {/* MEET LEE */}
      <section className="py-28">
        <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[28px] overflow-hidden bg-[#BDB5A6] aspect-[4/5]"><Img src={photos.lee} alt="Lee in the salon" className="h-full w-full" /></div>
          <div>
            <span className={eyebrow}>Meet Lee</span>
            <h2 className={`${h2} mt-4`}>{SALON.years} years behind the chair.</h2>
            <p className="mt-6 text-[20px] leading-[1.5]">Lee Ortivez has been a professional hairdresser for {SALON.years} years and is a licensed cosmetology instructor. Salon Ché moved from historic downtown Nampa to Almond Street in {SALON.movedYear}.</p>
            <blockquote className="mt-8 border-l-4 border-[#C8102E] pl-6 font-display text-[28px] leading-snug text-[#15130F]">“{SALON.quote}”<footer className="mt-3 font-sans text-[15px] text-[#67635B]">Lee Ortivez, designer, stylist and owner</footer></blockquote>
            <ul className="mt-8 space-y-3">{["Licensed cosmetology instructor", "Former TIGI ambassador, teaching at local schools and salons", "Rusk Designer training"].map((c) => <li key={c} className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-[3px] bg-[#C8102E] shrink-0" />{c}</li>)}</ul>
            <div className="mt-8"><ArrowLink href="/about">Read Lee&apos;s story</ArrowLink></div>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section className="pb-28">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6 mb-12"><div><span className={eyebrow}>Work</span><h2 className={`${h2} mt-4`}>Fresh from the chair.</h2></div><ArrowLink href="/work">See all work</ArrowLink></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {work.slice(0, 5).map((w, i) => (
              <figure key={i + w.src} className="group">
                <div className="relative overflow-hidden rounded-[20px] aspect-[3/4] bg-[#ECE7DC]"><Img src={w.src} alt={w.title} className="h-full w-full transition-transform duration-500 group-hover:scale-105" /></div>
                <figcaption className="mt-3"><span className={`${mono} inline-block rounded-full bg-[#FBE8EB] text-[#A00C24] px-2.5 py-1`}>{w.cat || "Cut"}</span><Link href={`/book?cat=${w.s || "cuts"}`} className="group mt-2 flex items-center gap-1.5 font-semibold text-[#15130F] hover:text-[#C8102E]">Book this look<Arrow /></Link></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-28 bg-[#F5F4F1]">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><span className={eyebrow}>Reviews</span><h2 className={`${h2} mt-4`}>What clients say.</h2></div>
            <div className="flex items-center gap-4"><span className="font-display d-heavy text-[56px] leading-none text-[#15130F]">{avg}</span><div><p className="text-[#DDA94B] text-xl tracking-[0.2em]">★★★★★</p><p className={`${mono} text-[#67635B]`}>on Google</p></div><FeatureTag id="reviews" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <figure key={r.id} className="rounded-[20px] bg-white p-8">
                <p className="text-[#DDA94B] tracking-[0.2em]">{"★".repeat(r.rating)}</p>
                <blockquote className="mt-4 text-[18px] leading-[1.55] text-[#15130F]">“{r.body}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3"><span className="h-10 w-10 rounded-full bg-[#ECEAE5] grid place-items-center font-semibold text-[#15130F]">{r.author[0]}</span><span><span className="block font-semibold text-[#15130F]">{r.author}</span><span className={`${mono} text-[#67635B]`}>Google review</span></span></figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10"><ArrowLink href="/reviews">Read all reviews</ArrowLink></div>
        </div>
      </section>

      {/* AFTER HOURS + GIFT CARDS */}
      <section className="py-28">
        <div className="container-x grid lg:grid-cols-2 gap-6">
          <div className="rounded-[28px] bg-[#15130F] text-white p-10 md:p-12 flex flex-col">
            <div className="flex justify-between items-start"><span className={`${mono} !text-[12px] text-[#DDA94B]`}>After hours</span><FeatureTag id="after-hours" /></div>
            <p className="font-display text-[44px] leading-[1.05] mt-6">Can&apos;t make it by 7? Ask.</p>
            <p className="mt-4 text-white/80 text-[18px] flex-1">Evenings and early mornings, by appointment. Send a request and Lee replies by text.</p>
            <Link href="/book/request" className="btn self-start mt-8 bg-white text-[#15130F] hover:bg-[#DDA94B]">Request a time</Link>
          </div>
          <div className="rounded-[28px] bg-[#DDA94B] text-[#15130F] p-10 md:p-12 grid sm:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-3"><span className={`${mono} !text-[12px]`}>Gift cards</span><FeatureTag id="gift-cards" /></div>
              <p className="font-display text-[44px] leading-[1.05] mt-6">Give a little shine.</p>
              <p className="mt-4 text-[18px]">Digital gift cards, sent by text or email in two taps. Any amount.</p>
              <Link href="/gift-cards" className="btn-dark mt-8">Send a gift card</Link>
            </div>
            <div className="w-56 aspect-[1.6/1] rounded-[18px] bg-[#15130F] text-white p-5 flex flex-col justify-between rotate-[-6deg] shadow-[0_8px_24px_rgba(21,19,15,.2)]">
              <Wordmark className="h-5 w-auto self-start" ink="#FFFFFF" />
              <div className="flex items-end justify-between"><span className={`${mono} text-[#DDA94B]`}>Gift card</span><span className="font-display d-heavy text-[40px] leading-none">$50</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section className="pb-28">
        <div className="container-x rounded-[28px] bg-[#F5F4F1] p-10 md:p-14 grid lg:grid-cols-[4fr_8fr] gap-10 items-center">
          <div>
            <div className="flex items-center gap-3"><span className={eyebrow}>Shop</span><FeatureTag id="shop" /></div>
            <h2 className={`${h2} mt-4`}>Take the shine home.</h2>
            <p className="mt-4 text-[18px]">Hair Evolution, Rusk and Lee&apos;s own Ekklesia oils. Pick up at the salon or have them shipped.</p>
            <Link href="/shop" className="btn-dark mt-8">Shop products</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((p) => (
              <Link key={p.slug} href={`/shop/${p.slug}`} className="d-lift block rounded-[20px] bg-white p-3">
                <div className="overflow-hidden rounded-[14px] aspect-square bg-[#ECE7DC]"><Img src={p.image} alt={`${p.brand} ${p.name}`} className="h-full w-full" /></div>
                <p className={`${mono} mt-3 text-[#67635B]`}>{p.brand}</p><p className="font-semibold text-[#15130F] text-[15px]">{p.name}</p><p className="tabular-nums">{money(p.price_cents)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="pb-28">
        <div className="container-x grid lg:grid-cols-2 gap-12">
          <div>
            <span className={eyebrow}>Visit</span>
            <h2 className={`${h2} mt-4`}>{SALON.street}, Nampa.</h2>
            <ul className="mt-10 border-t border-[#DDDAD3]">
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => { const h = hours[d]; return (
                <li key={d} className={`flex justify-between py-3.5 border-b border-[#DDDAD3] ${d === today ? "font-semibold text-[#15130F]" : ""}`}>
                  <span className="flex items-center gap-3">{DAY_LABEL[d]}{d === today && <span className={`${mono} rounded-full bg-[#FBE8EB] text-[#A00C24] px-2.5 py-1`}>Today</span>}</span>
                  <span className="tabular-nums">{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span>
                </li>
              ); })}
            </ul>
            <p className="mt-4 text-[#67635B]">After hours by appointment. Call or text to ask.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-dark">Get directions</a><a href={SALON.phoneHref} className="btn-ghost">Call</a><a href={SALON.smsHref} className="btn-ghost">Text</a></div>
          </div>
          <div className="rounded-[28px] overflow-hidden border border-[#DDDAD3] min-h-[440px] bg-[#ECE7DC]">
            <iframe title="Map to Salon Ché" src={mapEmbedUrl} className="h-full w-full min-h-[440px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    </div>
  );
}
