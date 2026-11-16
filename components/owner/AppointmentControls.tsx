"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SlotPicker, { fmtMin, prettyDate } from "@/components/booking/SlotPicker";
import { ownerSetStatus, ownerTakePayment, rescheduleAppointment, cancelAppointment } from "@/app/actions";

export default function AppointmentControls({ id, status, dueCents, minutes, phone }: { id: number; status: string; dueCents: number; minutes: number; phone: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [panel, setPanel] = useState<"" | "pay" | "move" | "cancel">("");
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState("card");
  const [slot, setSlot] = useState<{ date: string; min: number } | null>(null);
  const [msg, setMsg] = useState("");
  const run = (f: () => Promise<unknown>, m: string) => start(async () => { await f(); setPanel(""); setMsg(m); router.refresh(); });
  const done = ["completed", "cancelled", "no_show"].includes(status);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {status === "pending" && <button className="btn-dark btn-sm" disabled={pending} onClick={() => run(() => ownerSetStatus(id, "confirmed"), "Confirmed.")}>Mark confirmed</button>}
        {!done && <button className="btn-gold btn-sm" onClick={() => setPanel(panel === "pay" ? "" : "pay")}>Take payment</button>}
        {!done && <button className="btn-ghost btn-sm" onClick={() => setPanel(panel === "move" ? "" : "move")}>Move</button>}
        <a className="btn-ghost btn-sm" href={`sms:+1${phone}`}>Text client</a>
        {!done && <button className="btn-ghost btn-sm" disabled={pending} onClick={() => run(() => ownerSetStatus(id, "no_show"), "Marked as no-show. Deposit kept.")}>No-show</button>}
        {!done && <button className="btn-ghost btn-sm" onClick={() => setPanel(panel === "cancel" ? "" : "cancel")}>Cancel</button>}
      </div>
      {panel === "pay" && (
        <div className="rounded-2xl border border-sand p-5 bg-ivory space-y-4">
          <p className="font-display text-2xl">Take payment · ${(dueCents / 100).toFixed(2)} due</p>
          <div><p className="label">Tip</p><div className="flex flex-wrap gap-2">{[0, 15, 18, 20, 25].map((p) => { const c = Math.round((dueCents * p) / 100); return <button key={p} onClick={() => setTip(c)} className={`chip ${tip === c ? "chip-on" : ""}`}>{p ? `${p}% · $${(c / 100).toFixed(0)}` : "No tip"}</button>; })}</div></div>
          <div><p className="label">Method</p><div className="flex gap-2">{["card", "tap", "cash", "gift card"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`chip capitalize ${method === m ? "chip-on" : ""}`}>{m}</button>)}</div></div>
          <button className="btn-dark" disabled={pending} onClick={() => run(() => ownerTakePayment(id, dueCents, method, tip), "Paid and checked out.")}>Charge ${((dueCents + tip) / 100).toFixed(2)}</button>
          <p className="text-xs text-taupe">Card and tap use Stripe Terminal when connected (add-on). Demo records the payment.</p>
        </div>
      )}
      {panel === "move" && (
        <div className="rounded-2xl border border-sand p-5 bg-ivory">
          <SlotPicker duration={minutes} excludeId={id} value={slot} onChange={setSlot} />
          <button className="btn-dark mt-4" disabled={!slot || pending} onClick={() => run(() => rescheduleAppointment(id, slot!.date, slot!.min), "Moved. The client was texted.")}>{slot ? `Move to ${prettyDate(slot.date, false)} ${fmtMin(slot.min)}` : "Pick a time"}</button>
        </div>
      )}
      {panel === "cancel" && (
        <div className="rounded-2xl border border-rose/40 bg-rose/5 p-5">
          <p className="font-semibold">Cancel this visit? The client gets a text.</p>
          <button className="btn btn-sm bg-danger text-ivory mt-3" disabled={pending} onClick={() => run(() => cancelAppointment(id, "Cancelled by salon"), "Cancelled.")}>Cancel visit</button>
        </div>
      )}
      {msg && <p className="text-sm text-emerald-500">{msg}</p>}
    </div>
  );
}
