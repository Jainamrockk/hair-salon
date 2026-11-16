"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendCode, verifyCode } from "@/app/actions";

export default function SignIn() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [demo, setDemo] = useState<string | undefined>();
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="container-x py-16 md:py-24 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <p className="eyebrow-gold">Your account</p>
        <h1 className="h1 mt-4">Your visits, <em>in one place.</em></h1>
        <p className="lead mt-6 max-w-lg">No password. We text a 6-digit code to the mobile number you book with. Reschedule, cancel, rebook, see saved looks and message Lee.</p>
        <p className="text-sm text-taupe mt-6">Demo client: <button className="underline" onClick={() => setPhone("208-555-0142")}>(208) 555-0142</button> — Maria Gomez</p>
      </div>
      <div className="card p-8 md:p-10 bg-white">
        {stage === "phone" ? (
          <form onSubmit={(e) => { e.preventDefault(); setErr(""); start(async () => { const r = await sendCode(phone); if (!r.ok) return setErr(r.error); setDemo(r.demoCode); setStage("code"); }); }}>
            <h2 className="font-display text-4xl">Sign in</h2>
            <label className="label mt-6" htmlFor="sp">Mobile number</label>
            <div className="flex"><span className="rounded-l-xl border border-r-0 border-stone/50 bg-cream px-4 grid place-items-center text-taupe">+1</span><input id="sp" className="input !rounded-l-none" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(208) 555-0142" /></div>
            {err && <p role="alert" className="text-[#8a2f25] mt-3">{err}</p>}
            <button className="btn-dark w-full mt-6" disabled={pending}>{pending ? "Sending…" : "Text me a code"}</button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setErr(""); start(async () => { const r = await verifyCode(phone, code); if (!r.ok) return setErr(r.error); router.refresh(); }); }}>
            <h2 className="font-display text-4xl">Enter your code</h2>
            <p className="text-taupe mt-2">Sent to {phone}. <button type="button" className="underline" onClick={() => setStage("phone")}>Change</button></p>
            {demo && <p className="mt-4 rounded-xl bg-gold/10 border border-gold/30 p-3 text-sm">Demo mode (no SMS provider yet): your code is <b className="tracking-widest">{demo}</b></p>}
            <input className="input mt-6 text-center text-3xl tracking-[0.5em] font-display" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="6-digit code" />
            {err && <p role="alert" className="text-[#8a2f25] mt-3">{err}</p>}
            <button className="btn-dark w-full mt-6" disabled={pending || code.length !== 6}>{pending ? "Checking…" : "Sign in"}</button>
            <button type="button" className="w-full mt-3 text-sm underline text-taupe" onClick={() => start(async () => { const r = await sendCode(phone); if (r.ok) setDemo(r.demoCode); })}>Resend code</button>
          </form>
        )}
      </div>
    </div>
  );
}
