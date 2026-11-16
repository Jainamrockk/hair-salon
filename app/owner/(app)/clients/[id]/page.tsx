import Link from "next/link";
import { notFound } from "next/navigation";
import { OwnerHeader, Panel, Pill, Stat } from "@/components/owner/ui";
import { clientAppointments, fmtPhone } from "@/lib/data";
import { one, q } from "@/lib/db";
import { fmtDate, fmtTime, money } from "@/lib/time";
import { ownerSaveClient } from "@/app/actions";

export const metadata = { title: "Client" };
export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const c = await one<{ id: number; first_name: string; last_name: string | null; phone: string; email: string | null; notes: string | null; allergies: string | null; created_at: string; marketing: boolean }>(`SELECT * FROM clients WHERE id = $1`, [id]);
  if (!c) notFound();
  const appts = await clientAppointments(id);
  const looks = await q<{ shade: string; area: string }>(`SELECT shade, area FROM saved_looks WHERE client_id = $1`, [id]);
  const done = appts.filter((a) => a.status === "completed");
  const spent = done.reduce((a, x) => a + x.paid_cents, 0);
  return (
    <>
      <OwnerHeader eyebrow={`Client since ${fmtDate(c.created_at, { month: "long", year: "numeric" })}`} title={`${c.first_name} ${c.last_name ?? ""}`}>
        <Link href={`/owner/new?client=${c.id}`} className="btn-dark btn-sm">Book for {c.first_name}</Link>
        <Link href={`/owner/messages?c=${c.id}`} className="btn-ghost btn-sm">Message</Link>
        <a href={`tel:+1${c.phone}`} className="btn-ghost btn-sm">Call</a>
      </OwnerHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Visits" value={done.length} /><Stat label="Lifetime spend" value={money(spent)} />
        <Stat label="Average ticket" value={money(done.length ? Math.round(spent / done.length) : 0)} /><Stat label="No-shows" value={appts.filter((a) => a.status === "no_show").length} />
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <Panel className="p-6 xl:col-span-1">
          <p className="font-display text-2xl mb-4">Profile & formula notes</p>
          <form action={ownerSaveClient} className="space-y-3">
            <input type="hidden" name="id" value={c.id} />
            <div className="grid grid-cols-2 gap-2"><input name="first" defaultValue={c.first_name} className="input" aria-label="First name" /><input name="last" defaultValue={c.last_name ?? ""} className="input" aria-label="Last name" /></div>
            <input name="phone" defaultValue={fmtPhone(c.phone)} className="input" aria-label="Phone" />
            <input name="email" defaultValue={c.email ?? ""} className="input" placeholder="Email" aria-label="Email" />
            <label className="label" htmlFor="cn">Notes (formula, preferences)</label>
            <textarea id="cn" name="notes" rows={4} defaultValue={c.notes ?? ""} className="input" />
            <label className="label" htmlFor="ca">Allergies / patch test</label>
            <input id="ca" name="allergies" defaultValue={c.allergies ?? ""} className="input" />
            <button className="btn-dark btn-sm">Save</button>
          </form>
          {looks.length ? <p className="text-sm text-taupe mt-4">Saved try-on looks: {looks.map((l) => `${l.shade} (${l.area})`).join(", ")}</p> : null}
        </Panel>
        <Panel className="p-6 xl:col-span-2">
          <p className="font-display text-2xl mb-4">Visit history</p>
          <ul className="divide-y divide-sand">
            {appts.map((a) => (
              <li key={a.id}><Link href={`/owner/appointments/${a.id}`} className="py-3 flex justify-between gap-3 hover:bg-cream/40 px-2 -mx-2 rounded-lg">
                <div><p>{a.service_names}</p><p className="text-sm text-taupe">{fmtDate(a.starts_at, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {fmtTime(a.starts_at)}</p></div>
                <div className="text-right"><p className="font-display text-xl">{money(a.total_cents)}</p><Pill s={a.status} /></div>
              </Link></li>
            ))}
            {!appts.length && <li className="py-4 text-taupe">No visits yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
