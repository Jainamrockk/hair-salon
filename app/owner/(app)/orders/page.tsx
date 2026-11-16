import { OwnerHeader, Panel, Pill } from "@/components/owner/ui";
import { q } from "@/lib/db";
import { fmtPhone } from "@/lib/data";
import { fmtDate, money } from "@/lib/time";
import { ownerOrderStatus } from "@/app/actions";

export const metadata = { title: "Orders" };
export default async function Orders() {
  const orders = await q<{ id: number; name: string; phone: string; items: { name: string; qty: number; price: number }[]; total_cents: number; status: string; created_at: string }>(`SELECT * FROM orders ORDER BY created_at DESC`);
  const stock = await q<{ slug: string; brand: string; name: string; stock: number }>(`SELECT slug, brand, name, stock FROM products ORDER BY stock`);
  const cards = await q<{ code: string; amount_cents: number; balance_cents: number; to_name: string | null; created_at: string }>(`SELECT * FROM gift_cards ORDER BY created_at DESC LIMIT 10`);
  const next: Record<string, [string, string]> = { reserved: ["ready", "Mark ready · text client"], ready: ["picked_up", "Picked up"] };
  return (
    <>
      <OwnerHeader title="Orders" tag="shop" />
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {orders.map((o) => (
            <Panel key={o.id} className="p-6">
              <div className="flex justify-between gap-3"><p className="font-semibold">#{o.id} · {o.name}</p><Pill s={o.status} /></div>
              <p className="text-sm text-taupe">{fmtPhone(o.phone)} · {fmtDate(o.created_at)}</p>
              <ul className="mt-3">{o.items.map((i) => <li key={i.name}>{i.qty} × {i.name} <span className="text-taupe">· {money(i.price)}</span></li>)}</ul>
              <div className="flex justify-between items-center mt-4"><p className="font-display text-2xl">{money(o.total_cents)}</p>
                {next[o.status] && <form action={ownerOrderStatus.bind(null, o.id, next[o.status][0])}><button className="btn-dark btn-sm">{next[o.status][1]}</button></form>}</div>
            </Panel>
          ))}
          {!orders.length && <p className="text-taupe">No orders yet.</p>}
        </div>
        <div className="space-y-6">
          <Panel className="p-6"><p className="font-display text-2xl">Stock on the shelf</p>
            <ul className="mt-3 divide-y divide-sand text-sm">{stock.map((s) => <li key={s.slug} className="py-2 flex justify-between"><span>{s.brand} {s.name}</span><span className={s.stock <= 3 ? "text-[#8a2f25] font-semibold" : ""}>{s.stock}</span></li>)}</ul></Panel>
          <Panel className="p-6"><p className="font-display text-2xl">Gift cards sold</p>
            <ul className="mt-3 divide-y divide-sand text-sm">{cards.map((c) => <li key={c.code} className="py-2 flex justify-between"><span>{c.code}{c.to_name ? ` · ${c.to_name}` : ""}</span><span>{money(c.balance_cents)} / {money(c.amount_cents)}</span></li>)}</ul></Panel>
        </div>
      </div>
    </>
  );
}
