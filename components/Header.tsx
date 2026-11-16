"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monogram } from "./Logo";
import { SALON } from "@/lib/content";

const LEFT = [["/services", "Services"], ["/about", "Meet Lee"], ["/work", "Work"], ["/looks", "Looks"], ["/try-on", "Try-on"]];
const RIGHT = [["/shop", "Shop"], ["/gift-cards", "Gift cards"], ["/visit", "Visit"]];
const EXTRA = [["/reviews", "Reviews"], ["/book/request", "After-hours request"], ["/book/waitlist", "Waitlist"], ["/policies", "Policies"], ["/features", "Features & pricing"]];

export default function Header({ announcement, signedIn }: { announcement?: string; signedIn: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const home = path === "/";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 400 && y > last + 4) setHidden(true);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { document.documentElement.style.overflow = open ? "hidden" : ""; }, [open]);

  const item = ([href, label]: string[]) => (
    <Link key={href} href={href} className={`link-luxe whitespace-nowrap text-[0.9375rem] transition-colors hover:text-noir ${path.startsWith(href) ? "text-noir" : "text-noir/75"}`}>{label}</Link>
  );

  return (
    <>
      <motion.header initial={false} animate={{ y: hidden && !open ? "-100%" : "0%" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-700 ${scrolled || !home ? "border-b border-noir/10 bg-ivory/95 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <nav className="mx-auto grid h-20 max-w-[1700px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 md:px-10" aria-label="Primary">
          <div className="flex items-center gap-7">
            <button className="xl:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 8h18M3 16h18" /></svg>
            </button>
            <div className="hidden items-center gap-7 xl:flex">{LEFT.map(item)}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Link href="/" className="flex items-center gap-3 text-noir" aria-label="Salon Ché home">
              <Monogram className="h-7 w-7 text-gold-deep" />
              <span className="font-display text-[1.25rem] md:text-[1.35rem] tracking-[0.42em] uppercase leading-none">Salon Ché</span>
            </Link>
            {announcement ? <Link href="/book" className="hidden sm:block text-[0.6875rem] tracking-[0.08em] text-noir/55 transition-colors hover:text-noir">{announcement}</Link> : null}
          </div>
          <div className="flex items-center justify-end gap-7">
            <div className="hidden items-center gap-7 xl:flex">{RIGHT.map(item)}</div>
            <Link href="/account" aria-label={signedIn ? "My account" : "Sign in"} className="text-noir/70 hover:text-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            </Link>
            <Link href="/book" className="btn-dark btn-sm hidden sm:inline-flex">Book</Link>
          </div>
        </nav>
      </motion.header>
      {!home && <div className="h-20" aria-hidden />}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] flex flex-col bg-ivory/97 backdrop-blur-xl" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>
            <div className="flex h-20 items-center justify-between px-5">
              <span className="text-sm text-stone">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-10">
              <ul className="space-y-1">
                {[...LEFT, ...RIGHT, ["/account", signedIn ? "My account" : "Sign in"]].map(([href, label], i) => (
                  <motion.li key={href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.04, duration: 0.8 }}>
                    <Link href={href} className="block py-2 font-display text-4xl text-noir/90 hover:text-gold">{label}</Link>
                  </motion.li>
                ))}
              </ul>
              <div className="hairline my-8" />
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">{EXTRA.map(([href, label]) => <li key={href}><Link href={href} className="text-sm text-taupe hover:text-gold">{label}</Link></li>)}</ul>
              <div className="mt-10 flex flex-wrap gap-3"><Link href="/book" className="btn-dark">Book an appointment</Link><a href={SALON.phoneHref} className="btn-ghost">Call {SALON.phone}</a></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
