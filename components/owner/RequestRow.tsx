"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ownerOfferTimes, ownerRequestStatus } from "@/app/actions";

export default function RequestRow({ id, status, kind }: { id: number; status: string; kind: string }) {
  const router = useRouter();
  const [offer, setOffer] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const go = (f: () => Promise<void>) => start(async () => { await f(); router.refresh(); });
  if (status !== "new") return null;
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button className="btn-dark btn-sm" disabled={pending} onClick={() => go(() => ownerRequestStatus(id, "approved"))}>{kind === "waitlist" ? "Text: slot open" : "Approve"}</button>
        <button className="btn-ghost btn-sm" onClick={() => setOffer(!offer)}>Offer other times</button>
        <button className="btn-ghost btn-sm" disabled={pending} onClick={() => go(() => ownerRequestStatus(id, "declined"))}>Decline</button>
      </div>
      {offer && (
        <div className="mt-3 flex gap-2">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Thu 7:30 PM or Sat 8 AM" aria-label="Times to offer" />
          <button className="btn-gold btn-sm" disabled={!text || pending} onClick={() => go(() => ownerOfferTimes(id, text))}>Send</button>
        </div>
      )}
    </div>
  );
}
