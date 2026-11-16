"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { daySlots, monthAvailability } from "@/app/actions";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtMin = (n: number) => { const h = Math.floor(n / 60), m = n % 60, ap = h >= 12 ? "PM" : "AM"; return `${h % 12 || 12}:${pad(m)} ${ap}`; };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function todayStr() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Boise", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export const prettyDate = (d: string, long = true) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", weekday: long ? "long" : "short", month: "short", day: "numeric" });
export { fmtMin };

/** Month calendar + day slots, reading live availability from the database. */
export default function SlotPicker({ duration, excludeId, value, onChange, initialDate }: {
  duration: number; excludeId?: number; value?: { date: string; min: number } | null;
  onChange: (v: { date: string; min: number } | null) => void; initialDate?: string;
}) {
  const today = todayStr();
  const [month, setMonth] = useState(() => (initialDate || value?.date || today).slice(0, 7));
  const [avail, setAvail] = useState<Record<string, number>>({});
  const [date, setDate] = useState<string | null>(value?.date || initialDate || null);
  const [slots, setSlots] = useState<number[] | null>(null);
  const [pending, start] = useTransition();

  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay();

  useEffect(() => {
    let live = true;
    start(async () => {
      const a = await monthAvailability(`${month}-01`, daysIn, duration);
      if (!live) return;
      setAvail(a);
      if (!date || date.slice(0, 7) !== month) {
        const firstOpen = Object.keys(a).sort().find((d) => a[d] > 0);
        if (firstOpen) setDate(firstOpen);
      }
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, duration]);

  useEffect(() => {
    if (!date) return;
    let live = true;
    setSlots(null);
    daySlots(date, duration, excludeId).then((s) => live && setSlots(s));
    return () => { live = false; };
  }, [date, duration, excludeId]);

  const groups = useMemo(() => {
    const s = slots ?? [];
    return [["Morning", s.filter((x) => x < 720)], ["Afternoon", s.filter((x) => x >= 720 && x < 1020)], ["Evening", s.filter((x) => x >= 1020)]] as const;
  }, [slots]);

  const shift = (n: number) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); setMonth(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`); };
  const canPrev = month > today.slice(0, 7);

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <div className="card p-5 md:p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-2xl">{MONTHS[m - 1]} {y}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => shift(-1)} disabled={!canPrev} className="h-9 w-9 rounded-full border border-sand disabled:opacity-30 hover:border-noir" aria-label="Previous month">‹</button>
            <button type="button" onClick={() => shift(1)} className="h-9 w-9 rounded-full border border-sand hover:border-noir" aria-label="Next month">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] tracking-[0.02em] text-stone mb-2">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className={`grid grid-cols-7 gap-1 ${pending ? "opacity-60" : ""}`}>
          {Array.from({ length: lead }).map((_, i) => <span key={"e" + i} />)}
          {Array.from({ length: daysIn }).map((_, i) => {
            const d = `${month}-${pad(i + 1)}`; const n = avail[d];
            const open = n > 0, sel = d === date;
            return (
              <button type="button" key={d} disabled={!open} onClick={() => { setDate(d); onChange(null); }}
                className={`relative aspect-square rounded-xl text-sm transition ${sel ? "bg-noir text-ivory" : open ? "hover:bg-cream font-semibold" : "text-stone/50 line-through decoration-stone/30"}`}
                aria-label={`${prettyDate(d)}${open ? `, ${n} open` : ", unavailable"}`} aria-pressed={sel}>
                {i + 1}
                {d === today && <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />}
                {open && !sel && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gold" />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-5 text-xs text-taupe"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />Open times</span><span className="line-through">Fully booked</span></div>
      </div>
      <div>
        {date ? (
          <>
            <div className="flex items-baseline justify-between mb-4">
              <p className="font-display text-3xl">{prettyDate(date)}</p>
              <p className="text-xs tracking-[0.02em] text-taupe">{slots ? `${slots.length} open` : "Loading…"}</p>
            </div>
            {slots && slots.length === 0 && <p className="text-taupe">No times left this day for a visit this long.</p>}
            <div className="space-y-5">
              {groups.map(([label, list]) => list.length ? (
                <div key={label}>
                  <p className="eyebrow mb-2">{label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {list.map((s) => {
                      const sel = value?.date === date && value?.min === s;
                      return <button type="button" key={s} onClick={() => onChange({ date, min: s })} aria-pressed={sel}
                        className={`rounded-xl border py-3 text-sm font-semibold tabular-nums transition ${sel ? "bg-gold border-gold text-ivory" : "bg-white border-sand hover:border-noir"}`}>{fmtMin(s)}</button>;
                    })}
                  </div>
                </div>
              ) : null)}
            </div>
          </>
        ) : <p className="text-taupe">{pending ? "Finding open days…" : "No open days this month — try the next one."}</p>}
      </div>
    </div>
  );
}
