"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { joinWaitlist, requestAfterHours } from "@/app/actions";

function Sent({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-10 text-center bg-white">
      <div className="mx-auto h-16 w-16 rounded-full bg-gold text-white grid place-items-center text-2xl">✓</div>
      <h2 className="font-display text-5xl mt-6">{title}</h2>
      <p className="text-taupe mt-3">{body}</p>
      <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn-dark btn-sm">Back home</Link><Link href="/services" className="btn-ghost btn-sm">Browse services</Link></div>
    </div>
  );
}

export function AfterHoursForm({ service }: { service?: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  if (done) return <Sent title="Request sent." body="Lee reads every request personally and will reply by text, usually the same day." />;
  return (
    <form className="card p-6 md:p-10 bg-white space-y-5" action={(fd) => start(async () => { const r = await requestAfterHours(fd); r.ok ? setDone(true) : setErr(r.error); })}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label" htmlFor="n">Your name</label><input id="n" name="name" className="input" autoComplete="name" required /></div>
        <div><label className="label" htmlFor="p">Mobile number</label><input id="p" name="phone" className="input" inputMode="tel" autoComplete="tel" required /></div>
      </div>
      <div><label className="label" htmlFor="s">Service</label><input id="s" name="service" className="input" defaultValue={service} placeholder="e.g. Highlights, two colors" /></div>
      <div><label className="label" htmlFor="w">When would work?</label><input id="w" name="preferred" className="input" placeholder="e.g. Thursday after 7 PM, or Saturday 8 AM" required /></div>
      <div><label className="label" htmlFor="o">Anything else?</label><textarea id="o" name="notes" rows={3} className="input" /></div>
      {err && <p role="alert" className="text-[#8a2f25]">{err}</p>}
      <button className="btn-dark" disabled={pending}>{pending ? "Sending…" : "Send request"}</button>
      <p className="text-xs text-taupe">After-hours visits may carry a small premium. Lee confirms the price with you by text.</p>
    </form>
  );
}

const DAYS = [["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"]];
const TIMES = [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]];
export function WaitlistForm({ service, minutes }: { service?: string; minutes?: number }) {
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [weeks, setWeeks] = useState(2);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [svc, setSvc] = useState(service || "");
  const [done, setDone] = useState(false); const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const tog = (arr: string[], set: (x: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  if (done) return <Sent title="You're on the list." body="When a time opens that fits, you'll get a text and 30 minutes to take it." />;
  return (
    <div className="card p-6 md:p-10 bg-white space-y-6">
      <div><label className="label" htmlFor="ws">Service</label><input id="ws" className="input" value={svc} onChange={(e) => setSvc(e.target.value)} placeholder="What would you like booked?" />{minutes ? <p className="text-xs text-taupe mt-2">About {minutes} minutes</p> : null}</div>
      <div><p className="label">Days that work</p><div className="flex flex-wrap gap-2">{DAYS.map(([v, l]) => <button type="button" key={v} onClick={() => tog(days, setDays, v)} className={`chip ${days.includes(v) ? "chip-on" : ""}`}>{l}</button>)}</div></div>
      <div><p className="label">Times of day</p><div className="flex flex-wrap gap-2">{TIMES.map(([v, l]) => <button type="button" key={v} onClick={() => tog(times, setTimes, v)} className={`chip ${times.includes(v) ? "chip-on" : ""}`}>{l}</button>)}</div></div>
      <div><p className="label">For how long</p><div className="flex flex-wrap gap-2">{[1, 2, 4].map((w) => <button type="button" key={w} onClick={() => setWeeks(w)} className={`chip ${weeks === w ? "chip-on" : ""}`}>The next {w === 1 ? "week" : `${w} weeks`}</button>)}</div></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label" htmlFor="wn">Your name</label><input id="wn" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label" htmlFor="wp">Mobile number</label><input id="wp" className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <p className="text-sm text-taupe">When a time opens, the first person it fits gets a text and 30 minutes to take it.</p>
      {err && <p role="alert" className="text-[#8a2f25]">{err}</p>}
      <button className="btn-dark" disabled={pending} onClick={() => start(async () => { const r = await joinWaitlist({ name, phone, service: svc, days, times, weeks }); r.ok ? setDone(true) : setErr(r.error); })}>{pending ? "Joining…" : "Join the waitlist"}</button>
    </div>
  );
}
