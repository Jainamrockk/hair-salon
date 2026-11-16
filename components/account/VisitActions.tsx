"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SlotPicker, { fmtMin, prettyDate } from "@/components/booking/SlotPicker";
import { cancelAppointment, rescheduleAppointment } from "@/app/actions";

export default function VisitActions({ id, minutes, ics, freeCancel, deposit }: { id: number; minutes: number; ics: string; freeCancel: boolean; deposit: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "move" | "cancel">("none");
  const [slot, setSlot] = useState<{ date: string; min: number } | null>(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMode(mode === "move" ? "none" : "move")} className="btn-dark btn-sm">Reschedule</button>
        <a href={ics} download="salon-che.ics" className="btn-ghost btn-sm">Add to calendar</a>
        <button onClick={() => setMode(mode === "cancel" ? "none" : "cancel")} className="btn-ghost btn-sm">Cancel</button>
        <a href="sms:+12084665500&body=Running%20a%20few%20minutes%20late!" className="btn-ghost btn-sm">Running late</a>
      </div>
      {mode === "move" && (
        <div className="mt-6 rounded-2xl border border-sand p-5 bg-ivory">
          <p className="font-display text-2xl mb-4">Move this visit</p>
          <SlotPicker duration={minutes} excludeId={id} value={slot} onChange={setSlot} />
          <button disabled={!slot || pending} className="btn-gold mt-6" onClick={() => start(async () => { const r = await rescheduleAppointment(id, slot!.date, slot!.min); if (!r.ok) return setMsg(r.error); setMode("none"); setMsg("Moved. A new confirmation text is on its way."); router.refresh(); })}>
            {slot ? `Move to ${prettyDate(slot.date, false)}, ${fmtMin(slot.min)}` : "Pick a new time"}
          </button>
        </div>
      )}
      {mode === "cancel" && (
        <div className="mt-6 rounded-2xl border border-rose/40 bg-rose/5 p-5">
          <p className="font-display text-2xl">Cancel this visit?</p>
          <p className="text-sm text-taupe mt-2">{freeCancel ? "You're inside the free window — nothing is charged." : deposit ? `This is within 24 hours, so the $${deposit / 100} deposit is kept to cover Lee's time.` : "Thanks for letting Lee know."}</p>
          <label className="label mt-4" htmlFor={`r${id}`}>Reason (optional)</label>
          <select id={`r${id}`} className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Choose one</option><option>Schedule conflict</option><option>Feeling unwell</option><option>Found another time</option><option>Other</option>
          </select>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-sm bg-[#8a2f25] text-white hover:bg-[#6d241c]" disabled={pending} onClick={() => start(async () => { await cancelAppointment(id, reason); setMsg("Cancelled. We hope to see you soon."); router.refresh(); })}>Cancel visit</button>
            <button className="btn-ghost btn-sm" onClick={() => setMode("none")}>Keep it</button>
          </div>
        </div>
      )}
      {msg && <p className="mt-4 text-sm text-emerald-700">{msg}</p>}
    </div>
  );
}
