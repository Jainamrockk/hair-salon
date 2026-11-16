import Link from "next/link";
import Wordmark from "./Wordmark";
import { DAY_LABEL, SALON, directionsUrl } from "@/lib/content";
import { getHours } from "@/lib/data";
import { fmtMin, hhmmToMin } from "@/lib/time";

const mono = "font-mono text-[12px] font-medium tracking-[0.08em] uppercase";

/** Footer from the design file: the big "Let it shine." band in ink, then visit, hours, explore and contact. */
export default async function DesignFooter() {
  const hours = await getHours();
  return (
    <footer className="bg-[#15130F] text-white">
      <div className="container-x pt-24 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-white/15">
          <p className="font-display d-heavy text-[clamp(4rem,10vw,9rem)] leading-[0.86] tracking-[-0.045em]">Let it shine.</p>
          <Link href="/book" className="btn self-start md:self-auto bg-white text-[#15130F] hover:bg-[#C8102E] hover:text-white">Book an appointment</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-14">
          <div>
            <p className={`${mono} text-[#DDA94B] mb-4`}>Visit</p>
            <p className="text-[17px]">{SALON.street}<br />{SALON.city}</p>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-semibold underline underline-offset-4 hover:text-[#DDA94B]">Get directions</a>
          </div>
          <div>
            <p className={`${mono} text-[#DDA94B] mb-4`}>Hours</p>
            <ul className="space-y-1.5 text-[15px]">
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => { const h = (hours as any)[d]; return <li key={d} className="flex justify-between gap-6"><span className="text-white/70">{DAY_LABEL[d]}</span><span className="tabular-nums">{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span></li>; })}
            </ul>
          </div>
          <div>
            <p className={`${mono} text-[#DDA94B] mb-4`}>Explore</p>
            <ul className="space-y-2 text-[15px]">{[["/services", "Services and prices"], ["/about", "Meet Lee"], ["/work", "Work"], ["/looks", "Look book"], ["/try-on", "Virtual try-on"], ["/shop", "Shop"], ["/gift-cards", "Gift cards"]].map(([h, l]) => <li key={h}><Link href={h} className="hover:text-[#DDA94B]">{l}</Link></li>)}</ul>
          </div>
          <div>
            <p className={`${mono} text-[#DDA94B] mb-4`}>Contact</p>
            <ul className="space-y-2 text-[15px]">
              <li><a href={SALON.phoneHref} className="hover:text-[#DDA94B]">Call {SALON.phone}</a></li>
              <li><a href={SALON.smsHref} className="hover:text-[#DDA94B]">Text {SALON.phone}</a></li>
              <li><a href={`mailto:${SALON.email}`} className="hover:text-[#DDA94B]">{SALON.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-8 border-t border-white/15 text-sm text-white/60">
          <div className="flex items-center gap-4"><Wordmark className="h-6 w-auto" ink="#FFFFFF" /><span>© {new Date().getFullYear()} Salon Ché</span></div>
          <div className="flex flex-wrap gap-5">
            <Link href="/policies#privacy" className="hover:text-white">Privacy</Link>
            <Link href="/policies#accessibility" className="hover:text-white">Accessibility</Link>
            <Link href="/policies" className="hover:text-white">Cancellation policy</Link>
            <Link href="/features" className="hover:text-white">Features & pricing</Link>
            <Link href="/owner" className="hover:text-white">Owner login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
