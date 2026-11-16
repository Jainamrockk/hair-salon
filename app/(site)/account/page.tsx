import Link from "next/link";
import VisitActions from "@/components/account/VisitActions";
import FeatureTag from "@/components/FeatureTag";
import { clientId } from "@/lib/auth";
import { clientAppointments, getRules } from "@/lib/data";
import { icsHref } from "@/lib/ics";
import { fmtDate, fmtDuration, fmtTime, money } from "@/lib/time";

export const metadata = { title: "My visits" };
const STATUS: Record<string, string> = { confirmed: "Confirmed", pending: "Needs confirm", completed: "Completed", cancelled: "Cancelled", no_show: "Missed" };

export default async function AccountHome() {
  const cid = (await clientId())!;
  const [appts, rules] = await Promise.all([clientAppointments(cid), getRules()]);
  const now = Date.now();
  const upcoming = appts.filter((a) => new Date(a.starts_at).getTime() > now && ["confirmed", "pending"].includes(a.status)).reverse();
  const past = appts.filter((a) => !upcoming.includes(a));
  const visits = appts.filter((a) => a.status === "completed").length;
  const stamps = visits % 6;
  return (
    <div className="space-y-14">
      <section>
        <h1 className="font-display text-5xl font-light">Upcoming</h1>
        {upcoming.length ? upcoming.map((a) => {
          const minutes = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
          const free = new Date(a.starts_at).getTime() - now > rules.cancelHours * 3600_000;
          return (
            <article key={a.id} className="card p-7 md:p-9 bg-white mt-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="eyebrow-gold">{fmtDate(a.starts_at, { weekday: "long", month: "long", day: "numeric" })} · {fmtTime(a.starts_at)}</p>
                  <h2 className="font-display text-4xl mt-2">{a.service_names}</h2>
                  <p className="text-taupe mt-1">with Lee · {fmtDuration(minutes)} · {money(a.total_cents)}{a.paid_cents ? ` (${money(a.paid_cents)} paid)` : ""}</p>
                </div>
                <span className={`self-start rounded-full px-3 py-1 text-xs tracking-[0.02em] ${a.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{STATUS[a.status]}</span>
              </div>
              <VisitActions id={a.id} minutes={minutes} ics={icsHref(a)} freeCancel={free} deposit={a.deposit_cents} />
            </article>
          );
        }) : (
          <div className="card p-9 bg-white mt-6 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
            <div><p className="font-display text-3xl">Nothing booked yet.</p><p className="text-taupe mt-1">Lee&apos;s next openings are live on the booking page.</p></div>
            <Link href="/book" className="btn-dark">Book your next visit</Link>
          </div>
        )}
      </section>

      <section className="rounded-[26px] plinth ring-1 ring-gold/20 text-noir p-8 md:p-10">
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div><p className="eyebrow-gold">Loyalty card</p><p className="font-display text-4xl mt-2">Every 6th visit, a treatment on Lee.</p></div>
          <FeatureTag id="loyalty" />
        </div>
        <div className="mt-8 flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`h-14 w-14 md:h-16 md:w-16 rounded-full grid place-items-center border font-display text-2xl ${i < stamps ? "bg-gold border-gold text-ivory" : "border-noir/25 text-noir/30"}`}>{i < stamps ? "é" : i + 1}</span>
          ))}
        </div>
        <p className="text-sm text-noir/60 mt-5">{6 - stamps} more visit{6 - stamps === 1 ? "" : "s"} until a complimentary botanical deep-conditioning treatment.</p>
      </section>

      <section>
        <h2 className="font-display text-4xl font-light">Past visits</h2>
        <ul className="mt-6 divide-y divide-sand border-y border-sand">
          {past.length ? past.map((a) => (
            <li key={a.id} className="py-5 flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-lg">{a.service_names}</p><p className="text-sm text-taupe">{fmtDate(a.starts_at, { month: "short", day: "numeric", year: "numeric" })} · {STATUS[a.status]}</p></div>
              <div className="flex items-center gap-5"><span className="font-display text-2xl">{money(a.total_cents)}</span><Link href={`/book?s=${a.service_ids.join(",")}`} className="btn-ghost btn-sm">Rebook</Link></div>
            </li>
          )) : <li className="py-6 text-taupe">Your history will show here after your first visit.</li>}
        </ul>
      </section>
    </div>
  );
}
