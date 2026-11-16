"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { SALON } from "@/lib/content";

const NAV = [
  ["/services", "Services"], ["/about", "Meet Lee"], ["/work", "Work"], ["/try-on", "Try-On"],
  ["/shop", "Shop"], ["/gift-cards", "Gift Cards"], ["/visit", "Visit"],
];

export default function Header({ announcement, signedIn }: { announcement?: string; signedIn: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dark = path === "/";
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  const solid = scrolled || !dark || open;
  return (
    <>
      {announcement ? (
        <div className="bg-noir text-ivory text-[12px] tracking-[0.12em] uppercase">
          <div className="container-x flex items-center justify-center gap-4 py-2.5 text-center">
            <span className="text-gold">✦</span><span>{announcement}</span>
            <Link href="/book" className="underline underline-offset-4 decoration-gold hover:text-gold">Book it</Link>
          </div>
        </div>
      ) : null}
      <header className={`sticky top-0 z-40 transition-colors duration-300 ${solid ? "bg-ivory/90 backdrop-blur-md border-b border-sand/70" : "bg-transparent"}`}>
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <Link href="/" aria-label="Salon Ché home" className="text-[30px]"><Logo light={!solid} /></Link>
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={`text-[12px] uppercase tracking-[0.18em] font-semibold transition hover:text-gold ${!solid ? "text-ivory/90" : path.startsWith(href) ? "text-gold-deep" : "text-noir/80"}`}>{label}</Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-5">
            <Link href="/account" className={`text-[12px] uppercase tracking-[0.18em] font-semibold hover:text-gold ${!solid ? "text-ivory/90" : "text-noir/80"}`}>{signedIn ? "My account" : "Sign in"}</Link>
            <Link href="/book" className={solid ? "btn-dark btn-sm !px-5 !py-3" : "btn-light btn-sm !px-5 !py-3"}>Book now</Link>
          </div>
          <button className={`lg:hidden p-2 -mr-2 ${!solid ? "text-ivory" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 8h18M3 16h18" />}</svg>
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-sand bg-ivory h-[calc(100dvh-76px)] overflow-y-auto">
            <nav className="container-x py-8 flex flex-col gap-1" aria-label="Mobile">
              {[...NAV, ["/reviews", "Reviews"], ["/account", signedIn ? "My account" : "Sign in"]].map(([href, label], i) => (
                <Link key={href} href={href} className="font-display text-4xl font-light py-2 border-b border-sand/60 flex justify-between items-baseline">
                  {label}<span className="text-xs font-sans text-stone">0{i + 1}</span>
                </Link>
              ))}
              <Link href="/book" className="btn-dark mt-8">Book an appointment</Link>
              <a href={SALON.phoneHref} className="btn-ghost mt-3">Call {SALON.phone}</a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
