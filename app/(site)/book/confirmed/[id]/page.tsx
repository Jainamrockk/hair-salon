import Link from "next/link";
import { notFound } from "next/navigation";
import { appointmentById } from "@/lib/data";
import { clientId } from "@/lib/auth";
import { SALON, directionsUrl } from "@/lib/content";
import { fmtDate, fmtTime, money } from "@/lib/time";
import { icsHref } from "@/lib/ics";

export const metadata = { title: "You're booked" };

export default async function Confirmed({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [a, cid] = await Promise.all([appointmentById(Number(id)), clientId()]);
  if (!a || a.client_id !== cid) notFound();
  return (
    <section className="container-x py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-gold text-white grid place-items-center text-3xl animate-rise">✓</div>
        <p className="eyebrow-gold mt-8">Confirmed</p>
        <h1 className="h-display text-6xl md:text-8xl mt-4">You&apos;re booked, <em>{a.first_name}.</em></h1>
        <p className="lead mt-6">A confirmation text is on its way to your phone. You&apos;ll get reminders two days and two hours before.</p>
      </div>
      <div className="max-w-2xl mx-auto mt-14 rounded-[28px] bg-noir text-ivory p-8 md:p-10 grain relative overflow-hidden">
        <div className="flex justify-between items-start gap-4">
          <div><p className="eyebrow-gold">{fmtDate(a.starts_at, { weekday: "long", month: "long", day: "numeric" })}</p><p className="font-display text-5xl mt-2">{fmtTime(a.starts_at)}</p><p className="text-ivory/60">until {fmtTime(a.ends_at)}</p></div>
          <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs uppercase tracking-widest">Confirmed</span>
        </div>
        <div className="mt-8 border-t border-ivory/10 pt-6 space-y-2 text-ivory/80">
          <p className="text-ivory text-lg">{a.service_names}</p>
          <p>With Lee Ortivez · {SALON.street}, Nampa</p>
          <p>Total {money(a.total_cents)}{a.paid_cents ? ` · ${money(a.paid_cents)} deposit paid · ${money(a.total_cents - a.paid_cents)} at the salon` : " · pay at the salon"}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={icsHref(a)} download="salon-che.ics" className="btn-gold btn-sm">Add to calendar</a>
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-ghost-light btn-sm">Directions</a>
          <Link href="/account" className="btn-ghost-light btn-sm">Manage visit</Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto mt-8 grid sm:grid-cols-2 gap-4">
        <div className="card p-6"><p className="font-display text-2xl">Before you come</p><p className="text-sm text-taupe mt-2">Arrive with dry, brushed hair for color. Bring inspiration photos. Free parking out front.</p></div>
        <div className="card p-6"><p className="font-display text-2xl">Take the shine home</p><p className="text-sm text-taupe mt-2">Reserve Lee&apos;s favourite oils and masks to pick up at your visit.</p><Link href="/shop" className="link-arrow mt-3">Shop →</Link></div>
      </div>
    </section>
  );
}
