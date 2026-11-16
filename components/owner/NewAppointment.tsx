"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SlotPicker, { fmtMin, todayStr } from "@/components/booking/SlotPicker";
import { ownerCreateAppointment } from "@/app/actions";

type C = { id: number; first_name: string; last_name: string | null; phone: string };
type S = { id: number; category: string; name: string; duration_min: number; price_cents: number };

export default function NewAppointment({ clients, services, preClient }: { clients: C[]; services: S[]; preClient?: number }) {
  const router = useRouter();
  const [cid, setCid] = useState<number | "new">(preClient ?? clients[0]?.id ?? "new");
  const [search, setSearch] = useState("");
  const [nc, setNc] = useState({ first: "", last: "", phone: "" });
  const [ids, setIds] = useState<number[]>([]);
  const [slot, setSlot] = useState<{ date: string; min: number } | null>(null);
  const [manual, setManual] = useState({ on: false, date: todayStr(), time: "10:00" });
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const minutes = ids.reduce((a, i) => a + (services.find((s) => s.id === i)?.duration_min ?? 0), 0);
  const filtered = useMemo(() => clients.filter((c) => `${c.first_name} ${c.last_name} ${c.phone}`.toLowerCase().includes(search.toLowerCase())), [clients, search]);

  function submit() {
    setErr("");
    const when = manual.on ? { date: manual.date, start: +manual.time.split(":")[0] * 60 + +manual.time.split(":")[1] } : slot ? { date: slot.date, start: slot.min } : null;
    if (!when) return setErr("Pick a time.");
    start(async () => {
      const r = await ownerCreateAppointment({ clientId: cid === "new" ? undefined : cid, ...nc, serviceIds: ids, ...when, notes, force: manual.on });
      if (!r.ok) return setErr(r.error);
      router.push(`/owner/appointments/${r.id}`);
    });
  }
  return (
    <div className="grid xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="rounded-[22px] bg-white border border-sand p-6">
          <p className="font-display text-2xl mb-4">Client</p>
          <input className="input mb-3" placeholder="Search name or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search clients" />
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {filtered.map((c) => <button key={c.id} type="button" onClick={() => setCid(c.id)} className={`chip ${cid === c.id ? "chip-on" : ""}`}>{c.first_name} {c.last_name}</button>)}
            <button type="button" onClick={() => setCid("new")} className={`chip ${cid === "new" ? "chip-on" : ""}`}>+ New client</button>
          </div>
          {cid === "new" && <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <input className="input" placeholder="First name" value={nc.first} onChange={(e) => setNc({ ...nc, first: e.target.value })} aria-label="First name" />
            <input className="input" placeholder="Last name" value={nc.last} onChange={(e) => setNc({ ...nc, last: e.target.value })} aria-label="Last name" />
            <input className="input" placeholder="Mobile" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} aria-label="Mobile" />
          </div>}
        </div>
        <div className="rounded-[22px] bg-white border border-sand p-6">
          <p className="font-display text-2xl mb-4">Services</p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => <button key={s.id} type="button" onClick={() => setIds((x) => (x.includes(s.id) ? x.filter((y) => y !== s.id) : [...x, s.id]))} className={`chip !text-[13px] ${ids.includes(s.id) ? "chip-on" : ""}`}>{s.name} · ${s.price_cents / 100}</button>)}
          </div>
        </div>
        {ids.length > 0 && (
          <div className="rounded-[22px] bg-white border border-sand p-6">
            <div className="flex justify-between items-center mb-4"><p className="font-display text-2xl">Time</p>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={manual.on} onChange={(e) => setManual({ ...manual, on: e.target.checked })} className="h-4 w-4" />Book anyway (any time, overrides hours)</label></div>
            {manual.on ? (
              <div className="grid grid-cols-2 gap-3 max-w-md"><input type="date" className="input" value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} aria-label="Date" /><input type="time" className="input" value={manual.time} onChange={(e) => setManual({ ...manual, time: e.target.value })} aria-label="Time" /></div>
            ) : <SlotPicker duration={minutes} value={slot} onChange={setSlot} />}
          </div>
        )}
      </div>
      <aside className="rounded-[22px] bg-noir text-ivory p-6 self-start xl:sticky xl:top-8">
        <p className="eyebrow-gold">Summary</p>
        <ul className="mt-3 space-y-1">{ids.map((i) => { const s = services.find((x) => x.id === i)!; return <li key={i} className="flex justify-between text-sm"><span>{s.name}</span><span>${s.price_cents / 100}</span></li>; })}</ul>
        <p className="mt-3 text-sm text-ivory/60">{minutes} min{slot && !manual.on ? ` · ${slot.date} ${fmtMin(slot.min)}` : ""}</p>
        <label className="label !text-ivory/60 mt-5" htmlFor="nn">Notes</label>
        <textarea id="nn" rows={3} className="input !bg-ivory/10 !border-ivory/20 !text-ivory" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err && <p className="text-rose mt-3 text-sm">{err}</p>}
        <button className="btn-gold w-full mt-5" disabled={pending || !ids.length} onClick={submit}>{pending ? "Saving…" : "Book appointment"}</button>
        <p className="text-xs text-ivory/40 mt-2">The client gets a confirmation text.</p>
      </aside>
    </div>
  );
}
