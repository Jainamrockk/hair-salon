"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { ownerSignOut } from "@/app/actions";

type Counts = { msgs: number; reqs: number; revs: number; orders: number };
const GROUPS = (c: Counts) => [
  { title: "", items: [["/owner", "Today", 0], ["/owner/calendar", "Calendar", 0], ["/owner/clients", "Clients", 0], ["/owner/messages", "Messages", c.msgs], ["/owner/website", "Website", 0]] },
  { title: "Business", items: [["/owner/requests", "Requests", c.reqs], ["/owner/reviews", "Reviews", c.revs], ["/owner/money", "Earnings", 0], ["/owner/orders", "Orders", c.orders]] },
  { title: "Setup", items: [["/owner/hours", "Hours", 0], ["/owner/menu", "Prices", 0], ["/owner/rules", "Booking rules", 0], ["/owner/settings", "Salon settings", 0]] },
] as const;

export default function OwnerNav({ counts }: { counts: Counts }) {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/owner" ? p === "/owner" : p.startsWith(h));
  const nav = (
    <nav className="flex flex-col gap-6" aria-label="Owner">
      {GROUPS(counts).map((g) => (
        <div key={g.title}>
          {g.title && <p className="px-3 mb-2 text-[10px] tracking-[0.02em] text-ivory/40">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map(([h, l, n]) => (
              <li key={h}><Link href={h} onClick={() => setOpen(false)} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] transition ${active(h) ? "bg-ivory text-noir font-semibold" : "text-ivory/75 hover:bg-ivory/10"}`}>
                {l}{n ? <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] grid place-items-center ${active(h) ? "bg-gold text-ivory" : "bg-gold/90 text-ivory"}`}>{n}</span> : null}
              </Link></li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-noir text-ivory flex items-center justify-between px-5 h-16">
        <Link href="/owner" className="text-2xl"><Logo light /></Link>
        <div className="flex items-center gap-2"><Link href="/owner/new" className="btn-gold btn-sm !px-3">+ New</Link><button onClick={() => setOpen(!open)} className="p-2" aria-label="Menu">☰</button></div>
      </header>
      {open && <div className="lg:hidden fixed inset-0 top-16 z-40 bg-noir p-5 overflow-y-auto">{nav}</div>}
      <aside className="hidden lg:flex flex-col bg-noir text-ivory h-screen sticky top-0 p-5">
        <Link href="/owner" className="text-[28px] px-3 pt-2 pb-8"><Logo light /></Link>
        <Link href="/owner/new" className="btn-gold btn-sm mb-6">+ New appointment</Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-ivory/10 pt-4 mt-4 flex items-center gap-3 px-2">
          <span className="h-10 w-10 rounded-full bg-gold text-ivory grid place-items-center font-display text-xl">L</span>
          <div className="flex-1"><p className="text-sm font-semibold">Lee Ortivez</p><p className="text-xs text-ivory/50">Salon Ché</p></div>
          <form action={ownerSignOut}><button className="text-xs text-ivory/50 hover:text-ivory" title="Sign out">Sign out</button></form>
        </div>
        <Link href="/" target="_blank" className="text-xs text-ivory/40 hover:text-ivory px-2 mt-3">View live site ↗</Link>
      </aside>
    </>
  );
}
