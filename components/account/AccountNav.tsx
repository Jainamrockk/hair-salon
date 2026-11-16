"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [["/account", "Appointments"], ["/account/looks", "Saved looks"], ["/account/orders", "Orders & gift cards"], ["/account/messages", "Messages"], ["/account/settings", "Settings"]];
export default function AccountNav() {
  const p = usePathname();
  return (
    <nav className="mt-8 flex lg:flex-col gap-1 overflow-x-auto" aria-label="Account">
      {ITEMS.map(([h, l]) => (
        <Link key={h} href={h} className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition ${p === h ? "bg-noir text-ivory" : "hover:bg-cream"}`}>{l}</Link>
      ))}
    </nav>
  );
}
