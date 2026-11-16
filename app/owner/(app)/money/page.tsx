import { OwnerHeader, Panel, Stat } from "@/components/owner/ui";
import { q } from "@/lib/db";
import { addDays, fmtDateStr, localDate, localToUtc, money, weekdayKey } from "@/lib/time";
import { DAYS } from "@/lib/content";

export const metadata = { title: "Earnings" };
export default async function Money() {
  const today = localDate();
  const dow = DAYS.indexOf(weekdayKey(today) as any);
  const monday = addDays(today, dow === 0 ? -6 : 1 - dow);
  const lastMonday = addDays(monday, -7);
  const rows = await q<{ starts_at: string; total_cents: number; paid_cents: number; status: string }>(
    `SELECT starts_at, total_cents, paid_cents, status FROM appointments WHERE starts_at >= $1 AND starts_at < $2 AND status <> 'cancelled'`,
    [localToUtc(addDays(lastMonday, -7), 0).toISOString(), localToUtc(addDays(monday, 7), 0).toISOString()]);
  const sumFor = (from: string, to: string, f: (r: (typeof rows)[number]) => number) => rows.filter((r) => { const d = localDate(new Date(r.starts_at)); return d >= from && d < to; }).reduce((a, r) => a + f(r), 0);
  const val = (r: (typeof rows)[number]) => (r.status === "completed" ? r.paid_cents : r.status === "no_show" ? r.paid_cents : r.total_cents);
  const todayBooked = sumFor(today, addDays(today, 1), val);
  const thisWeek = sumFor(monday, addDays(monday, 7), val);
  const lastWeek = sumFor(lastMonday, monday, val);
  const prevWeek = sumFor(addDays(lastMonday, -7), lastMonday, val);
  const change = prevWeek ? Math.round(((lastWeek - prevWeek) / prevWeek) * 100) : 0;
  const days = Array.from({ length: 6 }, (_, i) => addDays(lastMonday, i)).map((d) => ({
    d, visits: rows.filter((r) => localDate(new Date(r.starts_at)) === d).length, cents: sumFor(d, addDays(d, 1), val),
  }));
  const max = Math.max(1, ...days.map((x) => x.cents));
  const deposits = sumFor(monday, addDays(monday, 7), (r) => (r.status !== "completed" ? r.paid_cents : 0));
  return (
    <>
      <OwnerHeader eyebrow={`Week of ${fmtDateStr(monday, { month: "short", day: "numeric" })}`} title="Earnings" tag="earnings" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Booked today" value={money(todayBooked)} />
        <Stat label="Booked this week" value={money(thisWeek)} />
        <Stat label="Last week" value={money(lastWeek)} sub={prevWeek ? `${change >= 0 ? "▲" : "▼"} ${Math.abs(change)}% on the week before` : undefined} />
        <Stat label="Next payout · Friday" value={money(deposits + Math.round(lastWeek * 0.4))} sub="Card payments and deposits" />
      </div>
      <div className="grid xl:grid-cols-5 gap-6 mt-8">
        <Panel className="xl:col-span-3 p-6">
          <p className="font-display text-3xl">Last week, by day</p>
          <p className="text-sm text-taupe">{fmtDateStr(lastMonday, { month: "short", day: "numeric" })} to {fmtDateStr(addDays(lastMonday, 5), { month: "short", day: "numeric" })} · {money(lastWeek)} from {days.reduce((a, x) => a + x.visits, 0)} visits</p>
          <div className="mt-8 h-64 flex items-end gap-4" role="img" aria-label="Earnings by day, last week">
            {days.map((x) => (
              <div key={x.d} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs tabular-nums">{money(x.cents)}</span>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-gold-deep to-gold-light transition-all" style={{ height: `${(x.cents / max) * 100}%`, minHeight: 4 }} />
                <span className="text-xs uppercase tracking-widest text-taupe">{fmtDateStr(x.d, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="xl:col-span-2 p-6">
          <p className="font-display text-3xl">Day by day</p>
          <table className="w-full mt-4 text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-widest text-taupe"><th className="py-2">Day</th><th>Visits</th><th className="text-right">Earned</th></tr></thead>
            <tbody>{days.map((x) => <tr key={x.d} className="border-t border-sand"><td className="py-2.5">{fmtDateStr(x.d, { weekday: "short", month: "short", day: "numeric" })}</td><td>{x.visits}</td><td className="text-right tabular-nums">{money(x.cents)}</td></tr>)}
              <tr className="border-t-2 border-noir font-semibold"><td className="py-2.5">Total</td><td>{days.reduce((a, x) => a + x.visits, 0)}</td><td className="text-right">{money(lastWeek)}</td></tr></tbody>
          </table>
          <p className="text-xs text-stone mt-4">Card payments and deposits reach your bank every Friday via Stripe. Cash is counted when you check a client out.</p>
        </Panel>
      </div>
    </>
  );
}
