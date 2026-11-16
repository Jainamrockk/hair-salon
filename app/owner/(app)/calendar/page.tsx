import Link from "next/link";
import { OwnerHeader, Panel } from "@/components/owner/ui";
import { categoryById, DAYS } from "@/lib/content";
import { appointmentsBetween, getHours } from "@/lib/data";
import { q } from "@/lib/db";
import { addDays, fmtDateStr, fmtMin, fmtTime, hhmmToMin, localDate, localMinutes, localToUtc, weekdayKey } from "@/lib/time";
import { ownerBlockTime, ownerDeleteBlock } from "@/app/actions";

export const metadata = { title: "Calendar" };
const START = 8 * 60, END = 20 * 60, PX = 1.1; // px per minute

export default async function Calendar({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const sp = await searchParams;
  const focus = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : localDate();
  const dow = DAYS.indexOf(weekdayKey(focus) as any);
  const monday = addDays(focus, dow === 0 ? -6 : 1 - dow);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const [appts, hours, blocks] = await Promise.all([
    appointmentsBetween(localToUtc(monday, 0), localToUtc(addDays(monday, 7), 0)),
    getHours(),
    q<{ id: number; starts_at: string; ends_at: string; reason: string }>(`SELECT * FROM blocks WHERE starts_at >= $1 AND starts_at < $2 ORDER BY starts_at`, [localToUtc(monday, 0).toISOString(), localToUtc(addDays(monday, 7), 0).toISOString()]),
  ]);
  const today = localDate();
  const nowMin = localMinutes(new Date());
  const top = (d: string | Date) => (localMinutes(new Date(d)) - START) * PX;
  return (
    <>
      <OwnerHeader eyebrow={`Week of ${fmtDateStr(monday, { month: "long", day: "numeric" })}`} title="Calendar" tag="owner-app">
        <Link href={`/owner/calendar?date=${addDays(monday, -7)}`} className="btn-ghost btn-sm">← Prev</Link>
        <Link href="/owner/calendar" className="btn-ghost btn-sm">This week</Link>
        <Link href={`/owner/calendar?date=${addDays(monday, 7)}`} className="btn-ghost btn-sm">Next →</Link>
        <Link href="/owner/new" className="btn-dark btn-sm">New appointment</Link>
      </OwnerHeader>
      <Panel className="overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-[60px_repeat(7,1fr)]">
          <div />
          {days.map((d) => (
            <div key={d} className={`px-3 py-3 border-b border-l border-sand ${d === today ? "bg-gold/10" : ""}`}>
              <p className="text-[11px] uppercase tracking-widest text-taupe">{fmtDateStr(d, { weekday: "short" })}</p>
              <p className={`font-display text-2xl ${d === today ? "text-gold-deep" : ""}`}>{fmtDateStr(d, { day: "numeric" })}</p>
            </div>
          ))}
          <div className="relative" style={{ height: (END - START) * PX }}>
            {Array.from({ length: (END - START) / 60 }).map((_, i) => <span key={i} className="absolute right-2 text-[10px] text-stone -translate-y-1/2" style={{ top: i * 60 * PX }}>{fmtMin(START + i * 60)}</span>)}
          </div>
          {days.map((d) => {
            const h = (hours as any)[weekdayKey(d)];
            const dayAppts = appts.filter((a) => localDate(new Date(a.starts_at)) === d);
            const dayBlocks = blocks.filter((b) => localDate(new Date(b.starts_at)) === d);
            return (
              <div key={d} className="relative border-l border-sand" style={{ height: (END - START) * PX, background: "repeating-linear-gradient(to bottom, transparent 0, transparent 65px, #eee6da 65px, #eee6da 66px)" }}>
                {h ? <>
                  <div className="absolute inset-x-0 top-0 bg-[#ece5da]/70" style={{ height: Math.max(0, (hhmmToMin(h.open) - START) * PX) }} />
                  <div className="absolute inset-x-0 bottom-0 bg-[#ece5da]/70" style={{ top: (hhmmToMin(h.close) - START) * PX }} />
                </> : <div className="absolute inset-0 bg-[#ece5da]/80 grid place-items-center text-xs uppercase tracking-widest text-stone">Closed</div>}
                {dayBlocks.map((b) => (
                  <div key={b.id} className="absolute inset-x-1 rounded-lg bg-[repeating-linear-gradient(45deg,#d8cdbd_0,#d8cdbd_6px,#e7dfd3_6px,#e7dfd3_12px)] text-[11px] p-1.5 text-cocoa overflow-hidden" style={{ top: top(b.starts_at), height: (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000 * PX }}>{b.reason}</div>
                ))}
                {dayAppts.map((a) => { const c = categoryById(a.category); const mins = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000; return (
                  <Link key={a.id} href={`/owner/appointments/${a.id}`} className={`absolute inset-x-1 rounded-lg p-2 text-[11px] leading-tight overflow-hidden shadow-sm hover:z-10 hover:shadow-soft transition ${a.status === "pending" ? "ring-2 ring-amber-400" : ""}`}
                    style={{ top: top(a.starts_at), height: Math.max(22, mins * PX - 2), background: c.hex, color: c.ink }}>
                    <p className="font-bold">{fmtTime(a.starts_at)} · {a.first_name}</p><p className="opacity-80">{a.service_names}</p>
                  </Link>
                ); })}
                {d === today && nowMin > START && nowMin < END && <div className="absolute inset-x-0 h-0.5 bg-rose z-20" style={{ top: (nowMin - START) * PX }}><span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose" /></div>}
              </div>
            );
          })}
        </div>
      </Panel>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Panel className="p-6">
          <p className="font-display text-3xl">Block time</p>
          <p className="text-sm text-taupe mt-1">Lunch, an errand, a day off — clients won&apos;t be able to book it.</p>
          <form action={ownerBlockTime} className="grid sm:grid-cols-4 gap-3 mt-5 items-end">
            <div className="sm:col-span-2"><label className="label" htmlFor="bd">Day</label><input id="bd" name="date" type="date" defaultValue={focus} className="input" required /></div>
            <div><label className="label" htmlFor="bf">From</label><input id="bf" name="from" type="time" defaultValue="12:00" className="input" required /></div>
            <div><label className="label" htmlFor="bt">To</label><input id="bt" name="to" type="time" defaultValue="13:00" className="input" required /></div>
            <div className="sm:col-span-3"><label className="label" htmlFor="br">Reason</label><input id="br" name="reason" className="input" placeholder="Lunch" /></div>
            <button className="btn-dark">Block</button>
          </form>
        </Panel>
        <Panel className="p-6">
          <p className="font-display text-3xl">Blocked this week</p>
          <ul className="mt-4 divide-y divide-sand">
            {blocks.length ? blocks.map((b) => (
              <li key={b.id} className="py-3 flex justify-between items-center gap-3"><span>{fmtDateStr(localDate(new Date(b.starts_at)), { weekday: "short", month: "short", day: "numeric" })} · {fmtTime(b.starts_at)}–{fmtTime(b.ends_at)} · {b.reason}</span>
                <form action={ownerDeleteBlock.bind(null, b.id)}><button className="text-sm underline text-taupe">Remove</button></form></li>
            )) : <li className="py-3 text-taupe">Nothing blocked.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
