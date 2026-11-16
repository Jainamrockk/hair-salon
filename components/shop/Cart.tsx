"use client";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { reserveOrder } from "@/app/actions";

type Item = { slug: string; name: string; brand: string; price: number; qty: number };
type Ctx = { items: Item[]; add: (i: Omit<Item, "qty">) => void; setQty: (slug: string, q: number) => void; open: boolean; setOpen: (b: boolean) => void; clear: () => void };
const C = createContext<Ctx | null>(null);
export const useCart = () => useContext(C)!;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem("sc_cart"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("sc_cart", JSON.stringify(items)); } catch {} }, [items]);
  const add: Ctx["add"] = (i) => { setItems((x) => { const e = x.find((y) => y.slug === i.slug); return e ? x.map((y) => (y.slug === i.slug ? { ...y, qty: y.qty + 1 } : y)) : [...x, { ...i, qty: 1 }]; }); setOpen(true); };
  const setQty = (slug: string, q: number) => setItems((x) => (q <= 0 ? x.filter((y) => y.slug !== slug) : x.map((y) => (y.slug === slug ? { ...y, qty: q } : y))));
  return <C.Provider value={{ items, add, setQty, open, setOpen, clear: () => setItems([]) }}>{children}<Drawer /></C.Provider>;
}

export function AddButton({ p, className = "btn-dark btn-sm" }: { p: Omit<Item, "qty">; className?: string }) {
  const { add } = useCart();
  return <button onClick={() => add(p)} className={className}>Add to bag</button>;
}
export function BagButton() {
  const { items, setOpen } = useCart();
  const n = items.reduce((a, i) => a + i.qty, 0);
  return <button onClick={() => setOpen(true)} className="btn-ghost btn-sm">Bag · {n}</button>;
}

function Drawer() {
  const { items, setQty, open, setOpen, clear } = useCart();
  const [f, setF] = useState({ name: "", phone: "", email: "" });
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-label="Your bag">
      <button className="absolute inset-0 bg-noir/40" aria-label="Close bag" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-ivory shadow-soft flex flex-col animate-rise">
        <div className="flex justify-between items-center p-6 border-b border-sand"><p className="font-display text-3xl">Your bag</p><button onClick={() => setOpen(false)} className="text-2xl" aria-label="Close">×</button></div>
        {done ? (
          <div className="p-8 text-center flex-1">
            <div className="mx-auto h-16 w-16 rounded-full bg-gold text-white grid place-items-center text-2xl">✓</div>
            <p className="font-display text-4xl mt-6">Reserved.</p>
            <p className="text-taupe mt-2">Order #{done}. We&apos;ll text you when it&apos;s ready at 507 Almond Street. Pay at pickup.</p>
            <button className="btn-dark btn-sm mt-6" onClick={() => { setDone(null); setOpen(false); }}>Keep browsing</button>
          </div>
        ) : items.length ? (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-sand px-6">
              {items.map((i) => (
                <li key={i.slug} className="py-4 flex justify-between gap-3">
                  <div><p className="text-xs uppercase tracking-widest text-taupe">{i.brand}</p><p className="font-display text-xl">{i.name}</p>
                    <div className="flex items-center gap-3 mt-2"><button className="h-7 w-7 rounded-full border border-sand" onClick={() => setQty(i.slug, i.qty - 1)} aria-label="Less">−</button><span>{i.qty}</span><button className="h-7 w-7 rounded-full border border-sand" onClick={() => setQty(i.slug, i.qty + 1)} aria-label="More">+</button></div></div>
                  <p className="font-display text-xl">${((i.price * i.qty) / 100).toFixed(0)}</p>
                </li>
              ))}
            </ul>
            <div className="p-6 border-t border-sand space-y-3 bg-white">
              <div className="flex justify-between text-lg"><span>Total · pay at pickup</span><span className="font-display text-2xl">${(total / 100).toFixed(2)}</span></div>
              <input className="input" placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Name" />
              <input className="input" placeholder="Mobile number" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-label="Mobile" />
              <input className="input" placeholder="Email (optional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" />
              {err && <p className="text-sm text-[#8a2f25]">{err}</p>}
              <button className="btn-dark w-full" disabled={pending} onClick={() => start(async () => { const r = await reserveOrder({ items: items.map((i) => ({ slug: i.slug, qty: i.qty })), ...f }); if (!r.ok) return setErr(r.error); clear(); setDone(r.id); })}>{pending ? "Reserving…" : "Reserve for pickup"}</button>
              <p className="text-xs text-taupe text-center">Pickup at the salon during opening hours.</p>
            </div>
          </>
        ) : <div className="p-8 text-taupe flex-1">Your bag is empty. <Link href="/shop" className="underline" onClick={() => setOpen(false)}>Shop products</Link></div>}
      </div>
    </div>
  );
}
