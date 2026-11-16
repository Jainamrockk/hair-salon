"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SlotPicker, { fmtMin, prettyDate } from "./SlotPicker";
import { createBooking } from "@/app/actions";

type Svc = { id: number; category: string; name: string; note: string | null; duration_min: number; price_cents: number; price_label: string | null };
type Cat = { id: string; name: string; shade: string; shadeName: string; hex: string; ink: string };
type Rules = { depositCents: number; depositMinMinutes: number; depositCategories: string[]; cancelHours: number; bookingPaused: boolean };

const $ = (c: number, f = false) => "$" + (c / 100).toLocaleString("en-US", { minimumFractionDigits: f ? 2 : 0, maximumFractionDigits: f ? 2 : 0 });
const dur = (m: number) => { const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`; };
const STEPS = ["Services", "Time", "Details", "Confirm"];

export default function BookingFlow({ services, categories, rules, initial, tags }: {
  services: Svc[]; categories: Cat[]; rules: Rules;
  initial: { ids: number[]; cat?: string; date?: string; name?: string; phone?: string };
  tags: Record<string, React.ReactNode>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initial.ids.length ? 1 : 0);
  const [ids, setIds] = useState<number[]>(initial.ids);
  const [cat, setCat] = useState(initial.cat || services.find((s) => s.id === initial.ids[0])?.category || "color");
  const [slot, setSlot] = useState<{ date: string; min: number } | null>(null);
  const [f, setF] = useState({ phone: initial.phone || "", first: initial.name || "", last: "", email: "", notes: "", firstColor: "", allergies: "", sms: true, marketing: false });
  const [photos, setPhotos] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [pay, setPay] = useState<"card" | "apple" | "google" | "gift">("card");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "", zip: "", gift: "" });
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const chosen = useMemo(() => ids.map((i) => services.find((s) => s.id === i)!).filter(Boolean), [ids, services]);
  const minutes = chosen.reduce((a, s) => a + s.duration_min, 0);
  const total = chosen.reduce((a, s) => a + s.price_cents, 0);
  const deposit = chosen.length && (minutes >= rules.depositMinMinutes || chosen.some((s) => rules.depositCategories.includes(s.category))) ? rules.depositCents : 0;
  const isColor = chosen.some((s) => ["color", "highlights"].includes(s.category) || /color|highlight/i.test(s.name));
  const toggle = (id: number) => setIds((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const up = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  const cancelBy = slot ? new Date(new Date(`${slot.date}T00:00:00Z`).getTime() + (slot.min - rules.cancelHours * 60) * 60000) : null;

  function next() {
    setErr("");
    if (step === 0 && !ids.length) return setErr("Pick at least one service.");
    if (step === 1 && !slot) return setErr("Pick a time.");
    if (step === 2) {
      if (f.phone.replace(/\D/g, "").length < 10) return setErr("Enter your 10-digit mobile number.");
      if (!f.first.trim()) return setErr("Add your first name.");
      if (isColor && !f.firstColor) return setErr("Let us know if you've had color with Lee before.");
    }
    if (step === 3) return submit();
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function submit() {
    if (deposit && !agree) return setErr("Please agree to the cancellation policy.");
    if (deposit && pay === "card" && (card.num.replace(/\D/g, "").length < 15 || !card.exp || card.cvc.length < 3)) return setErr("Check your card details.");
    if (deposit && pay === "gift" && !card.gift) return setErr("Enter your gift card code.");
    start(async () => {
      const r = await createBooking({
        serviceIds: ids, date: slot!.date, start: slot!.min, first: f.first, last: f.last, phone: f.phone, email: f.email,
        notes: [f.notes, photos.length ? `${photos.length} inspiration photo(s) attached` : ""].filter(Boolean).join("\n"),
        firstColor: f.firstColor === "no", allergies: f.allergies, marketing: f.marketing, agree, payWith: pay, giftCode: card.gift,
      });
      if (!r.ok) { setErr(r.error); if (/taken/.test(r.error)) setStep(1); return; }
      router.push(`/book/confirmed/${r.id}`);
    });
  }

  if (rules.bookingPaused) return (
    <div className="container-x py-24 text-center max-w-xl">
      <p className="eyebrow-gold">Booking paused</p>
      <h1 className="h1 mt-4">Back <em>very soon.</em></h1>
      <p className="lead mt-6">Lee has paused online booking for a few days. Text 208-466-5500 and you&apos;ll get a reply personally.</p>
      <Link href="/book/waitlist" className="btn-dark mt-8">Join the waitlist</Link>
    </div>
  );

  return (
    <div className="container-x pt-10 pb-28">
      {/* progress */}
      <ol className="flex items-center gap-2 md:gap-4 mb-10 overflow-x-auto">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 md:gap-4 shrink-0">
            <button type="button" disabled={i > step} onClick={() => setStep(i)} className={`flex items-center gap-2 text-[12px] tracking-[0.02em] font-semibold ${i === step ? "text-noir" : i < step ? "text-gold-deep" : "text-stone"}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] ${i < step ? "bg-gold text-ivory" : i === step ? "bg-noir text-ivory" : "border border-sand"}`}>{i < step ? "✓" : `0${i + 1}`}</span><span className={i === step ? "" : "hidden sm:inline"}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-4 md:w-14 bg-sand" />}
          </li>
        ))}
        <li className="ml-auto hidden md:block text-sm text-taupe">Need help? <a href="sms:+12084665500" className="underline">Text 208-466-5500</a></li>
      </ol>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 min-w-0">
          {step === 0 && (
            <section>
              <div className="flex items-center gap-3"><h1 className="h2">What are we doing?</h1></div>
              <p className="text-taupe mt-3">Choose one or more services. Combine color with a treatment, or add a brow wax to any visit.</p>
              <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
                {categories.map((c) => (
                  <button type="button" key={c.id} onClick={() => setCat(c.id)} className={`chip shrink-0 ${cat === c.id ? "chip-on" : "bg-white"}`}>
                    <span className="h-3 w-3 rounded-full ring-1 ring-white/50" style={{ background: c.hex }} />{c.name}
                    {ids.some((i) => services.find((s) => s.id === i)?.category === c.id) && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </button>
                ))}
              </div>
              <ul className="mt-6 space-y-3">
                {services.filter((s) => s.category === cat).map((s) => {
                  const on = ids.includes(s.id);
                  return (
                    <li key={s.id}>
                      <button type="button" onClick={() => toggle(s.id)} aria-pressed={on} className={`w-full text-left rounded-2xl border p-5 flex items-center gap-5 transition ${on ? "border-noir bg-white shadow-soft" : "border-sand bg-white/60 hover:border-stone"}`}>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${on ? "bg-noir border-noir text-ivory" : "border-stone"}`}>{on ? "✓" : ""}</span>
                        <span className="flex-1"><span className="block text-lg">{s.name}</span><span className="text-sm text-taupe">{dur(s.duration_min)}{s.note ? ` · ${s.note}` : ""}</span></span>
                        <span className="font-display text-2xl tabular-nums">{$(s.price_cents)}<span className="text-xs font-sans text-taupe"> {s.price_label ?? ""}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="h2">When works for you?</h1>
              <p className="text-taupe mt-3 mb-8">This visit takes about {dur(minutes)}. Times are Mountain Time.</p>
              <SlotPicker duration={minutes} value={slot} onChange={setSlot} initialDate={initial.date} />
              <div className="grid sm:grid-cols-2 gap-4 mt-10">
                <Link href={`/book/request?service=${encodeURIComponent(chosen.map((s) => s.name).join(" + "))}`} className="card p-6 hover:border-noir transition block">
                  <div className="flex justify-between gap-2"><p className="font-display text-2xl">Need an evening or early morning?</p>{tags["after-hours"]}</div>
                  <p className="text-sm text-taupe mt-2">Request an after-hours time. Lee replies by text.</p>
                </Link>
                <Link href={`/book/waitlist?service=${encodeURIComponent(chosen.map((s) => s.name).join(" + "))}&min=${minutes}`} className="card p-6 hover:border-noir transition block">
                  <div className="flex justify-between gap-2"><p className="font-display text-2xl">Nothing here fits?</p>{tags["waitlist"]}</div>
                  <p className="text-sm text-taupe mt-2">Join the waitlist and get a text when a slot opens.</p>
                </Link>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-10">
              <div><h1 className="h2">Who&apos;s coming in?</h1><p className="text-taupe mt-3">No account or password. Your mobile number is your key.</p></div>
              <div className="card p-6 md:p-8 bg-white space-y-5">
                <p className="font-display text-2xl">Your phone</p>
                <div><label className="label" htmlFor="ph">Mobile number</label>
                  <div className="flex"><span className="rounded-l-xl border border-r-0 border-stone/50 bg-cream px-4 grid place-items-center text-taupe">+1</span><input id="ph" inputMode="tel" autoComplete="tel-national" className="input !rounded-l-none" value={f.phone} onChange={(e) => up("phone", e.target.value)} placeholder="(208) 555-0142" /></div></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label" htmlFor="fn">First name</label><input id="fn" autoComplete="given-name" className="input" value={f.first} onChange={(e) => up("first", e.target.value)} /></div>
                  <div><label className="label" htmlFor="ln">Last name</label><input id="ln" autoComplete="family-name" className="input" value={f.last} onChange={(e) => up("last", e.target.value)} /></div>
                </div>
                <div><label className="label" htmlFor="em">Email <span className="normal-case tracking-normal font-normal">(optional — for your receipt)</span></label><input id="em" type="email" autoComplete="email" className="input" value={f.email} onChange={(e) => up("email", e.target.value)} /></div>
              </div>
              <div className="card p-6 md:p-8 bg-white space-y-5">
                <div className="flex justify-between items-start gap-3"><p className="font-display text-2xl">For Lee — your consultation</p>{tags["consultation"]}</div>
                <div><label className="label" htmlFor="nt">Anything Lee should know? <span className="normal-case tracking-normal font-normal">(optional)</span></label>
                  <textarea id="nt" rows={3} className="input" value={f.notes} onChange={(e) => up("notes", e.target.value)} placeholder="Growing out old highlights. I'd like to go a little darker for winter." /></div>
                <div>
                  <p className="label">Inspiration photos <span className="normal-case tracking-normal font-normal">(optional, up to 3)</span></p>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sand p-6 cursor-pointer hover:border-gold text-taupe text-sm">
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { const fl = Array.from(e.target.files || []).slice(0, 3); setPhotos(fl.map((x) => URL.createObjectURL(x))); }} />
                    <span className="font-semibold text-noir">Add photos</span>JPG or PNG
                  </label>
                  {photos.length ? <div className="flex gap-3 mt-3">{photos.map((p) => <img key={p} src={p} alt="Inspiration" className="h-20 w-20 rounded-xl object-cover" />)}</div> : null}
                </div>
                {isColor && (
                  <div>
                    <p className="label">Have you had color with Lee before?</p>
                    <div className="flex gap-2">{[["yes", "Yes"], ["no", "No, this is my first"]].map(([v, l]) => <button type="button" key={v} onClick={() => up("firstColor", v)} className={`chip ${f.firstColor === v ? "chip-on" : "bg-white"}`}>{l}</button>)}</div>
                    {f.firstColor === "no" && (
                      <div className="mt-4 rounded-2xl bg-gold/10 border border-gold/30 p-5 text-sm">
                        <p className="font-semibold">A quick allergy test may be needed</p>
                        <p className="text-taupe mt-1">Some color lines ask for a patch test 48 hours before a first color. If yours does, Lee will text you to arrange a 5-minute stop by the salon.</p>
                        <label className="label mt-4" htmlFor="al">Known allergies or sensitivities</label>
                        <input id="al" className="input" value={f.allergies} onChange={(e) => up("allergies", e.target.value)} placeholder="e.g. PPD, sensitive scalp" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="card p-6 md:p-8 bg-white space-y-4">
                <div className="flex justify-between items-start gap-3"><p className="font-display text-2xl">Texts</p>{tags["sms"]}</div>
                <label className="flex gap-3 items-start"><input type="checkbox" className="mt-1 h-5 w-5" checked={f.sms} onChange={(e) => up("sms", e.target.checked)} /><span>Text me my confirmation and reminders<span className="block text-sm text-taupe">One confirmation and two reminders per visit. Reply STOP to end.</span></span></label>
                <label className="flex gap-3 items-start"><input type="checkbox" className="mt-1 h-5 w-5" checked={f.marketing} onChange={(e) => up("marketing", e.target.checked)} /><span>Also text me offers and open-slot alerts<span className="block text-sm text-taupe">A few a month at most. Stop any time.</span></span></label>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-8">
              <div><h1 className="h2">{deposit ? "Hold your spot." : "Review & confirm."}</h1>
                <p className="text-taupe mt-3">{deposit ? `A ${$(deposit)} deposit confirms this visit. It comes off your total at the salon.` : "No deposit needed for this visit — you pay at the salon."}</p></div>
              <div className="card p-6 md:p-8 bg-white">
                <p className="font-display text-2xl">Cancellation policy</p>
                <ul className="mt-3 space-y-2 text-taupe">
                  <li>✦ Free to reschedule or cancel until {cancelBy ? cancelBy.toLocaleString("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""} — {rules.cancelHours} hours before.</li>
                  {deposit ? <li>✦ After that, or if you miss the visit, the {$(deposit)} deposit is kept.</li> : null}
                </ul>
                {deposit ? <label className="flex items-center gap-3 mt-5 font-semibold"><input type="checkbox" className="h-5 w-5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />I agree to the cancellation policy</label> : null}
              </div>
              {deposit ? (
                <div className="card p-6 md:p-8 bg-white space-y-5">
                  <div className="flex justify-between items-start gap-3"><p className="font-display text-2xl">Pay the {$(deposit)} deposit</p>{tags["deposits"]}</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPay("apple")} className={`rounded-xl py-3.5 font-semibold ${pay === "apple" ? "bg-noir text-ivory ring-4 ring-gold/30" : "bg-noir/90 text-ivory"}`}>Apple Pay</button>
                    <button type="button" onClick={() => setPay("google")} className={`rounded-xl py-3.5 font-semibold border ${pay === "google" ? "border-noir ring-4 ring-gold/30" : "border-sand"} bg-white`}>G Pay</button>
                  </div>
                  <div className="flex items-center gap-3 text-xs tracking-[0.02em] text-stone"><span className="h-px flex-1 bg-sand" />or<span className="h-px flex-1 bg-sand" /></div>
                  <div className="flex gap-2">{(["card", "gift"] as const).map((p) => <button type="button" key={p} onClick={() => setPay(p)} className={`chip ${pay === p ? "chip-on" : "bg-white"}`}>{p === "card" ? "Pay by card" : "Use a gift card"}</button>)}</div>
                  {pay === "card" && (
                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-6"><label className="label" htmlFor="cn">Card number</label><input id="cn" inputMode="numeric" autoComplete="cc-number" className="input tracking-widest" placeholder="4242 4242 4242 4242" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })} /></div>
                      <div className="col-span-2"><label className="label" htmlFor="ce">Expiry</label><input id="ce" autoComplete="cc-exp" className="input" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} /></div>
                      <div className="col-span-2"><label className="label" htmlFor="cc">CVC</label><input id="cc" inputMode="numeric" autoComplete="cc-csc" className="input" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></div>
                      <div className="col-span-2"><label className="label" htmlFor="cz">ZIP</label><input id="cz" autoComplete="postal-code" className="input" value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value.slice(0, 5) })} /></div>
                    </div>
                  )}
                  {pay === "gift" && <div><label className="label" htmlFor="gc">Gift card code</label><input id="gc" className="input uppercase" placeholder="CHE-XXXX-XXXX" value={card.gift} onChange={(e) => setCard({ ...card, gift: e.target.value })} /><p className="text-xs text-taupe mt-2">Try the demo card CHE-GIFT-2026.</p></div>}
                  <p className="text-xs text-taupe flex items-center gap-2">🔒 Secure payment by Stripe. Salon Ché never sees your card number. <span className="italic">(Demo mode: no real charge.)</span></p>
                </div>
              ) : null}
            </section>
          )}
          {err && <p role="alert" className="mt-6 rounded-xl bg-rose/10 border border-rose/40 text-danger px-4 py-3">{err}</p>}
        </div>

        {/* summary */}
        <aside className="lg:col-span-4 min-w-0">
          <div className="lg:sticky lg:top-28 rounded-[26px] plinth ring-1 ring-gold/20 text-noir p-7">
            <p className="eyebrow-gold">Your appointment</p>
            {chosen.length ? (
              <ul className="mt-4 divide-y divide-noir/10">
                {chosen.map((s) => (
                  <li key={s.id} className="py-3 flex justify-between gap-3">
                    <div><p>{s.name}</p><p className="text-xs text-noir/50">{dur(s.duration_min)}</p></div>
                    <div className="text-right"><p className="font-display text-xl">{$(s.price_cents)}</p>{step === 0 && <button type="button" onClick={() => toggle(s.id)} className="text-[11px] text-noir/50 hover:text-gold-light">Remove</button>}</div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-noir/60">Nothing chosen yet.</p>}
            <div className="mt-4 space-y-1.5 text-sm text-noir/70 border-t border-noir/10 pt-4">
              <p>With Lee Ortivez</p>
              {slot && <p className="text-noir">{prettyDate(slot.date, false)} · {fmtMin(slot.min)} – {fmtMin(slot.min + minutes)}</p>}
              <p>507 Almond Street, Nampa</p>
              {minutes ? <p>About {dur(minutes)}</p> : null}
            </div>
            <div className="mt-5 border-t border-noir/10 pt-4 space-y-1">
              <div className="flex justify-between"><span>Services</span><span className="font-display text-2xl">{$(total, true)}</span></div>
              {deposit && step >= 3 ? <><div className="flex justify-between text-gold-light"><span>Deposit, due today</span><span>{$(deposit, true)}</span></div><div className="flex justify-between text-noir/60 text-sm"><span>Due at the salon</span><span>{$(total - deposit, true)}</span></div></> : null}
            </div>
            <button type="button" onClick={next} disabled={pending} className="btn-gold w-full mt-6">
              {pending ? "Booking…" : step === 3 ? (deposit ? `Pay ${$(deposit)} and book` : "Confirm booking") : step === 2 ? "Review and confirm" : "Continue"}
            </button>
            <p className="text-xs text-noir/50 mt-3 text-center">Nothing is charged until you confirm.</p>
            {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="w-full mt-3 text-xs tracking-[0.02em] text-noir/60 hover:text-ivory">← Back</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
