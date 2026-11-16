"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import UiToggle from "@/components/UiToggle";
import { SALON } from "@/lib/content";

const NAV = [["/services", "Services"], ["/about", "Meet Lee"], ["/work", "Work"], ["/shop", "Shop"], ["/gift-cards", "Gift cards"], ["/visit", "Visit"]];
const MORE = [["/looks", "Look book"], ["/try-on", "Virtual try-on"], ["/reviews", "Reviews"]];
const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase";

/** Header from the design file: the special bar in ink, then a white sticky bar — wordmark, navigation, phone, Book. */
export default function DesignHeader({ announcement, signedIn }: { announcement?: string; signedIn: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  const [label, rest] = (announcement || "").includes("—") ? announcement!.split(/\s*—\s*/, 2) : ["Special", announcement || ""];
  return (
    <>
      {announcement ? (
        <div className="bg-[#15130F] text-white">
          <div className="container-x flex flex-wrap items-center justify-center gap-x-3 min-h-[44px] text-center">
            <span className={`${mono} text-[#DDA94B]`}>{label}</span>
            <span className="text-sm font-medium">{rest}</span>
            <Link href="/book" className="text-sm font-semibold underline underline-offset-[3px] hover:text-[#DDA94B]">Book it</Link>
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DDDAD3]">
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Link href="/" aria-label="Salon Ché, home" className="flex items-center min-h-[44px]"><Wordmark className="h-7 md:h-8 w-auto" /></Link>
          <nav aria-label="Main" className="hidden xl:flex items-center gap-8">
            {NAV.map(([h, l]) => <Link key={h} href={h} className={`whitespace-nowrap text-[15px] font-medium hover:text-[#C8102E] ${path.startsWith(h) ? "text-[#C8102E]" : "text-[#15130F]"}`}>{l}</Link>)}
          </nav>
          <div className="flex items-center gap-4 md:gap-5">
            <UiToggle initial="design" className="hidden sm:inline-flex" />
            <a href={SALON.phoneHref} className="hidden 2xl:flex whitespace-nowrap items-center gap-2 text-[15px] font-semibold text-[#15130F] hover:text-[#C8102E]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" /></svg>{SALON.phone}
            </a>
            <Link href="/try-on" className="hidden xl:inline whitespace-nowrap text-[15px] font-medium text-[#15130F] hover:text-[#C8102E]">Try-on</Link>
            <Link href="/account" className="hidden md:inline whitespace-nowrap text-[15px] font-medium text-[#15130F] hover:text-[#C8102E]">{signedIn ? "Account" : "Sign in"}</Link>
            <Link href="/book" className="btn-dark !min-h-[48px] hidden sm:inline-flex">Book an appointment</Link>
            <button className="xl:hidden p-2 -mr-2 text-[#15130F]" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
        {open && (
          <div className="xl:hidden border-t border-[#DDDAD3] bg-white h-[calc(100dvh-80px)] overflow-y-auto">
            <nav className="container-x py-6 flex flex-col" aria-label="Mobile">
              {[...NAV, ...MORE, ["/account", signedIn ? "Account" : "Sign in"]].map(([h, l]) => (
                <Link key={h} href={h} className="flex items-center justify-between py-4 border-b border-[#DDDAD3] font-display text-3xl">{l}<span aria-hidden>→</span></Link>
              ))}
              <div className="flex items-center justify-between py-5"><span className="text-[#67635B]">Design UI</span><UiToggle initial="design" compact /></div>
              <Link href="/book" className="btn-dark mt-2">Book an appointment</Link>
              <a href={SALON.phoneHref} className="btn-ghost mt-3">Call {SALON.phone}</a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
