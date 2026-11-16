"use client";
import { useState, useTransition } from "react";
import { ownerSaveHours } from "@/app/actions";

const ORDER: [string, string][] = [["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"]];
type H = Record<string, { open: string; close: string } | null>;

export default function HoursEditor({ initial }: { initial: H }) {
  const [h, setH] = useState<H>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (d: string, v: { open: string; close: string } | null) => { setSaved(false); setH({ ...h, [d]: v }); };
  return (
    <div className="rounded-[22px] bg-white border border-sand p-6 md:p-8 max-w-3xl">
      <ul className="divide-y divide-sand">
        {ORDER.map(([d, l]) => { const v = h[d]; return (
          <li key={d} className="py-4 grid grid-cols-[120px_auto_1fr] gap-4 items-center">
            <span className="font-semibold">{l}</span>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v} onChange={(e) => set(d, e.target.checked ? { open: "10:00", close: "18:00" } : null)} className="h-5 w-5 accent-[#15110F]" />Open</label>
            {v ? <div className="flex items-center gap-2"><input type="time" value={v.open} onChange={(e) => set(d, { ...v, open: e.target.value })} className="input !py-2 !w-36" aria-label={`${l} opens`} /><span>–</span><input type="time" value={v.close} onChange={(e) => set(d, { ...v, close: e.target.value })} className="input !py-2 !w-36" aria-label={`${l} closes`} /></div> : <span className="text-taupe">Closed</span>}
          </li>
        ); })}
      </ul>
      <div className="flex items-center gap-4 mt-6">
        <button className="btn-dark" disabled={pending} onClick={() => start(async () => { await ownerSaveHours(h); setSaved(true); })}>{pending ? "Saving…" : "Publish hours"}</button>
        {saved && <span className="text-emerald-700 text-sm">Live on the website and in booking.</span>}
      </div>
    </div>
  );
}
