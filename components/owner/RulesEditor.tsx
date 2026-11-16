"use client";
import { useState, useTransition } from "react";
import { ownerSaveRules } from "@/app/actions";

type R = { depositCents: number; depositMinMinutes: number; depositCategories: string[]; cancelHours: number; bufferMin: number; minNoticeHours: number; maxDaysAhead: number; bookingPaused: boolean; slotStepMin: number };
const CATS = [["color", "Color"], ["highlights", "Highlights"], ["perms", "Perms"], ["smoothing", "Smoothing"], ["cuts", "Cuts"], ["him", "For him"]];

export default function RulesEditor({ initial }: { initial: R }) {
  const [r, setR] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const up = (k: keyof R, v: unknown) => { setSaved(false); setR({ ...r, [k]: v }); };
  const num = (k: keyof R, label: string, suffix: string, help: string, mult = 1) => (
    <div className="py-5 border-b border-sand grid md:grid-cols-[1fr_200px] gap-3 items-center">
      <div><p className="font-semibold">{label}</p><p className="text-sm text-taupe">{help}</p></div>
      <label className="flex items-center gap-2"><input type="number" min={0} className="input !py-2" value={(r[k] as number) / mult} onChange={(e) => up(k, Number(e.target.value) * mult)} aria-label={label} /><span className="text-sm text-taupe whitespace-nowrap">{suffix}</span></label>
    </div>
  );
  return (
    <div className="rounded-[22px] bg-white border border-sand p-6 md:p-8 max-w-3xl">
      <div className="py-5 border-b border-sand flex justify-between items-center gap-4">
        <div><p className="font-semibold">Pause online booking</p><p className="text-sm text-taupe">For vacations or illness. Clients see a friendly note and the waitlist.</p></div>
        <button onClick={() => up("bookingPaused", !r.bookingPaused)} role="switch" aria-checked={r.bookingPaused} className={`h-8 w-14 rounded-full relative transition ${r.bookingPaused ? "bg-danger" : "bg-sand"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${r.bookingPaused ? "left-7" : "left-1"}`} /></button>
      </div>
      {num("depositCents", "Deposit amount", "dollars", "Taken when booking qualifying visits online. Comes off the total.", 100)}
      {num("depositMinMinutes", "Deposit for visits longer than", "minutes", "Any visit this long or longer takes a deposit.")}
      <div className="py-5 border-b border-sand"><p className="font-semibold">Always take a deposit for</p><div className="flex flex-wrap gap-2 mt-3">{CATS.map(([v, l]) => <button key={v} onClick={() => up("depositCategories", r.depositCategories.includes(v) ? r.depositCategories.filter((x) => x !== v) : [...r.depositCategories, v])} className={`chip ${r.depositCategories.includes(v) ? "chip-on" : ""}`}>{l}</button>)}</div></div>
      {num("cancelHours", "Free cancellation until", "hours before", "After this, the deposit is kept.")}
      {num("bufferMin", "Buffer between clients", "minutes", "Time to clean up and mix color.")}
      {num("minNoticeHours", "Minimum notice", "hours", "How soon before a slot clients can book online.")}
      {num("maxDaysAhead", "Book up to", "days ahead", "How far ahead the calendar opens.")}
      {num("slotStepMin", "Start times every", "minutes", "Spacing of time slots shown to clients.")}
      <div className="flex items-center gap-4 mt-6">
        <button className="btn-dark" disabled={pending} onClick={() => start(async () => { await ownerSaveRules(r); setSaved(true); })}>{pending ? "Saving…" : "Save rules"}</button>
        {saved && <span className="text-emerald-500 text-sm">Saved — booking uses these rules now.</span>}
      </div>
    </div>
  );
}
