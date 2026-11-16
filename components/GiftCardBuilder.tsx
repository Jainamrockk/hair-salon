"use client";
import { useState, useTransition } from "react";
import { buyGiftCard, checkGiftCard } from "@/app/actions";

const DESIGNS = [
  { id: "noir", label: "Noir", cls: "from-[#2a211c] via-[#3b2c22] to-[#7a5d37] text-[#f0e6d6] ring-1 ring-[#d6bd92]/30" },
  { id: "champagne", label: "Champagne", cls: "from-[#efe5d4] via-[#d9c29a] to-[#b39762] text-[#1b1613]" },
  { id: "cherry", label: "Cherry", cls: "from-[#3a0d17] via-[#6e1524] to-[#a14a26] text-[#f0e6d6]" },
];

export default function GiftCardBuilder() {
  const [amount, setAmount] = useState(50);
  const [other, setOther] = useState("");
  const [design, setDesign] = useState("noir");
  const [f, setF] = useState({ buyerName: "", buyerEmail: "", toName: "", toEmail: "", note: "" });
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const [bal, setBal] = useState({ code: "", result: "" });
  const amt = other ? Number(other) : amount;
  const d = DESIGNS.find((x) => x.id === design)!;

  const card = (
    <div className={`relative aspect-[1.6/1] rounded-[24px] bg-gradient-to-br ${d.cls} p-7 md:p-9 flex flex-col justify-between shadow-soft overflow-hidden`}>
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-current opacity-15" />
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-current opacity-10" />
      <div className="flex justify-between items-start"><span className="font-display text-3xl">Salon <em>Ché</em></span><span className="text-[10px] tracking-[0.02em] opacity-70">Gift card</span></div>
      <div>
        {f.toName && <p className="text-sm opacity-80">For {f.toName}</p>}
        <p className="font-display text-6xl md:text-7xl">${amt || 0}</p>
        {f.note && <p className="text-sm italic opacity-80 mt-1 line-clamp-2">“{f.note}”</p>}
      </div>
    </div>
  );

  if (code) return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {card}
      <div>
        <p className="eyebrow-gold">Sent</p>
        <h2 className="h2 mt-3">A little shine, <em>on its way.</em></h2>
        <p className="lead mt-4">{f.toEmail ? `We've emailed the card to ${f.toEmail}` : "We've emailed the card to you"} with your note. Receipt sent to {f.buyerEmail}.</p>
        <p className="mt-6 rounded-2xl bg-white border border-sand p-5">Card code <b className="tracking-widest font-display text-2xl block mt-1">{code}</b><span className="text-sm text-taupe">Redeem on any visit or in the shop. Never expires.</span></p>
        <button className="btn-ghost mt-6" onClick={() => setCode(null)}>Send another</button>
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="lg:sticky lg:top-28 self-start space-y-6">
        {card}
        <div className="flex gap-3">{DESIGNS.map((x) => <button key={x.id} onClick={() => setDesign(x.id)} className={`chip ${design === x.id ? "chip-on" : ""}`}><span className={`h-4 w-4 rounded-full bg-gradient-to-br ${x.cls}`} />{x.label}</button>)}</div>
        <ol className="grid grid-cols-3 gap-3 text-sm text-taupe pt-4">
          {["Pick an amount and write a note.", "We email it to you or straight to them.", "They redeem it on any visit or in the shop."].map((t, i) => <li key={i} className="border-t border-sand pt-3"><span className="font-display text-2xl text-gold block">{i + 1}</span>{t}</li>)}
        </ol>
      </div>
      <div className="card p-7 md:p-10 bg-white space-y-6">
        <div>
          <p className="label">Amount</p>
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75, 100, 150].map((a) => <button key={a} onClick={() => { setAmount(a); setOther(""); }} className={`chip ${!other && amount === a ? "chip-on" : ""}`}>${a}</button>)}
            <input className="input !w-32 !py-2 !rounded-full" placeholder="Other $" inputMode="numeric" value={other} onChange={(e) => setOther(e.target.value.replace(/\D/g, ""))} aria-label="Other amount" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label" htmlFor="tn">Their name</label><input id="tn" className="input" value={f.toName} onChange={(e) => setF({ ...f, toName: e.target.value })} /></div>
          <div><label className="label" htmlFor="te">Send to (email)</label><input id="te" type="email" className="input" value={f.toEmail} onChange={(e) => setF({ ...f, toEmail: e.target.value })} placeholder="Blank = send to me" /></div>
        </div>
        <div><label className="label" htmlFor="nt">Add a note <span className="normal-case tracking-normal font-normal">(optional)</span></label><textarea id="nt" rows={3} className="input" maxLength={160} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label" htmlFor="bn">Your name</label><input id="bn" className="input" value={f.buyerName} onChange={(e) => setF({ ...f, buyerName: e.target.value })} /></div>
          <div><label className="label" htmlFor="be">Your email</label><input id="be" type="email" className="input" value={f.buyerEmail} onChange={(e) => setF({ ...f, buyerEmail: e.target.value })} /></div>
        </div>
        {err && <p role="alert" className="text-danger">{err}</p>}
        <button className="btn-dark w-full" disabled={pending} onClick={() => start(async () => { setErr(""); const r = await buyGiftCard({ amount: amt, design, ...f }); r.ok ? setCode(r.code) : setErr(r.error); })}>{pending ? "Processing…" : `Buy gift card — $${amt || 0}`}</button>
        <p className="text-xs text-taupe text-center">🔒 Secure checkout by Stripe (demo mode: no real charge).</p>
        <div className="border-t border-sand pt-6">
          <p className="label">Check a balance</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await checkGiftCard(bal.code); setBal({ ...bal, result: r ? `$${(r.balance_cents / 100).toFixed(2)} of $${(r.amount_cents / 100).toFixed(0)} left` : "Card not found" }); }); }}>
            <input className="input uppercase" placeholder="CHE-XXXX-XXXX" value={bal.code} onChange={(e) => setBal({ code: e.target.value, result: "" })} aria-label="Gift card code" />
            <button className="btn-ghost btn-sm">Check</button>
          </form>
          {bal.result && <p className="text-sm mt-2">{bal.result}</p>}
        </div>
      </div>
    </div>
  );
}
