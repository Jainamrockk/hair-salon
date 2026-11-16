import Link from "next/link";
import FeatureTag from "@/components/FeatureTag";
import { clientId } from "@/lib/auth";
import { one, q } from "@/lib/db";
import { fmtDate, money } from "@/lib/time";

export const metadata = { title: "Orders" };
const ST: Record<string, string> = { reserved: "Reserved", ready: "Ready for pickup", picked_up: "Picked up", cancelled: "Cancelled" };
export default async function Orders() {
  const cid = (await clientId())!;
  const me = await one<{ phone: string; email: string | null }>(`SELECT phone, email FROM clients WHERE id = $1`, [cid]);
  const orders = await q<{ id: number; items: { name: string; qty: number; price: number }[]; total_cents: number; status: string; created_at: string }>(`SELECT * FROM orders WHERE phone = $1 ORDER BY created_at DESC`, [me!.phone]);
  const cards = me?.email ? await q<{ code: string; balance_cents: number; amount_cents: number; to_name: string | null }>(`SELECT code, balance_cents, amount_cents, to_name FROM gift_cards WHERE buyer_email = $1 OR to_email = $1`, [me.email]) : [];
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3"><h1 className="font-display text-5xl font-light">Orders</h1><FeatureTag id="shop" /></div>
        {orders.length ? (
          <ul className="mt-6 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="card p-6 bg-white">
                <div className="flex justify-between gap-4"><p className="eyebrow">Order #{o.id} · {fmtDate(o.created_at)}</p><span className="text-xs uppercase tracking-widest rounded-full bg-cream px-3 py-1">{ST[o.status] ?? o.status}</span></div>
                <ul className="mt-3 text-lg">{o.items.map((i) => <li key={i.name}>{i.qty} × {i.name}</li>)}</ul>
                <p className="mt-3 font-display text-2xl">{money(o.total_cents)} <span className="text-sm font-sans text-taupe">· pay at pickup</span></p>
              </li>
            ))}
          </ul>
        ) : <div className="card p-8 bg-white mt-6"><p className="text-taupe">No orders yet.</p><Link href="/shop" className="btn-dark btn-sm mt-4">Shop products</Link></div>}
      </section>
      <section>
        <div className="flex items-center gap-3"><h2 className="font-display text-4xl font-light">Gift cards</h2><FeatureTag id="gift-cards" /></div>
        {cards.length ? <ul className="mt-6 grid sm:grid-cols-2 gap-4">{cards.map((c) => (
          <li key={c.code} className="rounded-2xl bg-gradient-to-br from-noir to-cocoa text-ivory p-6"><p className="font-display text-xl">Salon <em>Ché</em></p><p className="font-display text-4xl mt-6">{money(c.balance_cents)}</p><p className="text-xs text-ivory/60 tracking-widest mt-1">{c.code}{c.to_name ? ` · for ${c.to_name}` : ""}</p></li>
        ))}</ul> : <p className="text-taupe mt-4">Gift cards bought with your email show here. <Link href="/gift-cards" className="underline">Send one</Link>.</p>}
      </section>
    </div>
  );
}
