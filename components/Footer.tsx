import Link from "next/link";
import Logo from "./Logo";
import { DAY_LABEL, SALON, directionsUrl } from "@/lib/content";
import { getHours } from "@/lib/data";
import { fmtMin, hhmmToMin } from "@/lib/time";

export default async function Footer() {
  const hours = await getHours();
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return (
    <footer className="bg-noir text-ivory/80 grain relative overflow-hidden">
      <div className="container-x pt-24 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-16 border-b border-ivory/10">
          <h2 className="h-display text-6xl md:text-[120px] text-ivory">Let it <em className="text-gold-light">shine.</em></h2>
          <Link href="/book" className="btn-gold self-start md:self-auto">Book an appointment</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-14">
          <div>
            <p className="eyebrow-gold mb-4">Visit</p>
            <p className="text-ivory">{SALON.street}<br />{SALON.city}</p>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="link-arrow mt-5 text-gold-light">Get directions →</a>
          </div>
          <div>
            <p className="eyebrow-gold mb-4">Hours</p>
            <ul className="space-y-1.5 text-sm">
              {order.map((d) => { const h = (hours as any)[d]; return (
                <li key={d} className="flex justify-between gap-6"><span>{DAY_LABEL[d]}</span><span className="text-ivory tabular-nums">{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span></li>
              ); })}
            </ul>
            <p className="mt-3 text-xs text-ivory/50">After hours by appointment.</p>
          </div>
          <div>
            <p className="eyebrow-gold mb-4">Explore</p>
            <ul className="space-y-2 text-sm">
              {[["/services", "Services & prices"], ["/about", "Meet Lee"], ["/work", "Work"], ["/reviews", "Reviews"], ["/shop", "Shop"], ["/gift-cards", "Gift cards"], ["/try-on", "Virtual try-on"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-gold-light">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow-gold mb-4">Contact</p>
            <ul className="space-y-2 text-sm">
              <li><a href={SALON.phoneHref} className="hover:text-gold-light">Call {SALON.phone}</a></li>
              <li><a href={SALON.smsHref} className="hover:text-gold-light">Text {SALON.phone}</a></li>
              <li><a href={`mailto:${SALON.email}`} className="hover:text-gold-light">{SALON.email}</a></li>
            </ul>
            <p className="mt-6 text-xs text-ivory/50">Carrying {SALON.brands.join(" · ")}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-8 border-t border-ivory/10 text-xs text-ivory/50">
          <div className="flex items-center gap-4"><span className="text-xl"><Logo light /></span><span>© {new Date().getFullYear()} Salon Ché · Nampa, Idaho</span></div>
          <div className="flex flex-wrap gap-5">
            <Link href="/policies#privacy" className="hover:text-ivory">Privacy</Link>
            <Link href="/policies#accessibility" className="hover:text-ivory">Accessibility</Link>
            <Link href="/policies" className="hover:text-ivory">Cancellation policy</Link>
            <Link href="/features" className="hover:text-ivory">Features & pricing</Link>
            <Link href="/owner" className="hover:text-ivory">Owner login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
