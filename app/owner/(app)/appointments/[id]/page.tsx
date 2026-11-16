import Link from "next/link";
import { notFound } from "next/navigation";
import { OwnerHeader, Panel, Pill } from "@/components/owner/ui";
import AppointmentControls from "@/components/owner/AppointmentControls";
import { appointmentById, fmtPhone } from "@/lib/data";
import { one } from "@/lib/db";
import { categoryById } from "@/lib/content";
import { fmtDate, fmtDuration, fmtTime, money } from "@/lib/time";

export const metadata = { title: "Appointment" };
export default async function Appt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await appointmentById(Number(id));
  if (!a) notFound();
  const c = await one<{ notes: string | null; allergies: string | null; visits: number }>(`SELECT notes, allergies, (SELECT COUNT(*)::int FROM appointments WHERE client_id = $1 AND status = 'completed') AS visits FROM clients WHERE id = $1`, [a.client_id]);
  const mins = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
  const cat = categoryById(a.category);
  return (
    <>
      <OwnerHeader eyebrow={`${fmtDate(a.starts_at, { weekday: "long", month: "long", day: "numeric" })} · ${fmtTime(a.starts_at)}`} title={a.service_names}>
        <Pill s={a.status} />
      </OwnerHeader>
      <div className="grid xl:grid-cols-3 gap-6">
        <Panel className="xl:col-span-2 p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div><p className="label">Time</p><p className="text-lg">{fmtTime(a.starts_at)} – {fmtTime(a.ends_at)}</p><p className="text-sm text-taupe">{fmtDuration(mins)}</p></div>
            <div><p className="label">Total</p><p className="font-display text-3xl">{money(a.total_cents)}</p><p className="text-sm text-taupe">{money(a.paid_cents)} paid{a.deposit_cents ? ` · ${money(a.deposit_cents)} deposit` : ""}</p></div>
            <div><p className="label">Category</p><p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: cat.hex }} />{cat.shade} · {cat.name}</p></div>
          </div>
          {a.first_color && <p className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">⚠︎ First color with Lee — arrange a patch test 48 hours before.</p>}
          {a.notes && <div><p className="label">Notes from booking</p><p className="whitespace-pre-line">{a.notes}</p></div>}
          <AppointmentControls id={a.id} status={a.status} dueCents={Math.max(0, a.total_cents - a.paid_cents)} minutes={mins} phone={a.phone!} />
        </Panel>
        <Panel className="p-6 space-y-3">
          <p className="label">Client</p>
          <p className="font-display text-3xl">{a.first_name} {a.last_name}</p>
          <p className="text-taupe">{fmtPhone(a.phone!)}{a.email ? ` · ${a.email}` : ""}</p>
          <p className="text-sm">{c?.visits ?? 0} completed visits</p>
          {c?.allergies && <p className="text-sm text-[#8a2f25]">Allergies: {c.allergies}</p>}
          {c?.notes && <p className="text-sm text-taupe border-l-2 border-gold pl-3">{c.notes}</p>}
          <Link href={`/owner/clients/${a.client_id}`} className="btn-ghost btn-sm">Open profile</Link>
        </Panel>
      </div>
    </>
  );
}
