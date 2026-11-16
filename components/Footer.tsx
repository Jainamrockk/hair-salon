import Link from "next/link";
import { Monogram } from "./Logo";
import { DAY_LABEL, SALON, directionsUrl } from "@/lib/content";
import { getHours } from "@/lib/data";
import { fmtMin, hhmmToMin } from "@/lib/time";

const COLUMNS = [
  { title: "The salon", links: [["Meet Lee", "/about"], ["Work", "/work"], ["Reviews", "/reviews"], ["Visit", "/visit"]] },
  { title: "Services", links: [["Services & prices", "/services"], ["Book an appointment", "/book"], ["After-hours request", "/book/request"], ["Virtual try-on", "/try-on"]] },
  { title: "Client care", links: [["Your account", "/account"], ["Shop", "/shop"], ["Gift cards", "/gift-cards"], ["Policies", "/policies"]] },
];

export default async function Footer() {
  const hours = await getHours();
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return (
    <footer className="relative border-t border-noir/10 bg-ivory">
      <div className="container-x py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_2.4fr]">
          <div>
            <Monogram className="h-10 w-10 text-gold-deep" />
            <p className="mt-8 max-w-sm font-display text-4xl leading-tight">One chair. One guest at a time. Thirty-four years of craft.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/book" className="btn-dark">Book an appointment</Link><a href={SALON.smsHref} className="btn-ghost">Text Lee</a></div>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-6 space-y-3">{col.links.map(([label, href]) => <li key={href}><Link href={href} className="link-luxe text-sm text-taupe hover:text-noir">{label}</Link></li>)}</ul>
              </div>
            ))}
            <div>
              <p className="eyebrow">Hours</p>
              <ul className="mt-6 space-y-1.5 text-sm text-taupe">
                {order.map((d) => { const h = (hours as any)[d]; return <li key={d} className="flex justify-between gap-4"><span>{DAY_LABEL[d].slice(0, 3)}</span><span className="text-noir/85">{h ? `${fmtMin(hhmmToMin(h.open))}–${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span></li>; })}
              </ul>
            </div>
          </div>
        </div>
        <div className="hairline my-16" />
        <div className="flex flex-col justify-between gap-6 text-sm text-stone md:flex-row">
          <p>{SALON.street}, {SALON.city} · <a href={directionsUrl} target="_blank" rel="noreferrer" className="link-luxe text-noir/80">Directions</a> · <a href={SALON.phoneHref} className="link-luxe text-noir/80">{SALON.phone}</a> · <a href={`mailto:${SALON.email}`} className="link-luxe text-noir/80">{SALON.email}</a></p>
          <div className="flex flex-wrap gap-5">
            <Link href="/policies#privacy" className="link-luxe hover:text-noir">Privacy</Link>
            <Link href="/policies#accessibility" className="link-luxe hover:text-noir">Accessibility</Link>
            <Link href="/features" className="link-luxe hover:text-noir">Features & pricing</Link>
            <Link href="/owner" className="link-luxe hover:text-noir">Owner login</Link>
            <span>© {new Date().getFullYear()} Salon Ché</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
