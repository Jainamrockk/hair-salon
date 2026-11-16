"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type M = { role: "user" | "assistant"; content: string; links?: { href: string; label: string }[]; handoff?: boolean };
const STARTERS = ["What does color cost?", "My roots are showing", "When is Lee free this week?", "Where do I park?"];

export default function Assistant({ tag }: { tag?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<M[]>([{ role: "assistant", content: "Hi! I'm Salon Ché's AI assistant. I can help you pick a service, check prices and hours, or find a time with Lee. What are you thinking about?" }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  async function send(q: string) {
    if (!q.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: q.trim() }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }) });
      const d = await r.json();
      setMsgs([...next, { role: "assistant", content: d.text, links: d.links, handoff: d.handoff }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "I'm offline right now. Text Lee at 208-466-5500." }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label={open ? "Close assistant" : "Open salon assistant"}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full glass text-noir pl-4 pr-5 py-3.5 shadow-soft hover:border-gold/50 transition">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-ivory font-display text-lg">é</span>
        <span className="text-[12px] tracking-[0.02em] font-semibold hidden sm:inline">{open ? "Close" : "Ask Salon Ché"}</span>
      </button>
      {open && (
        <div className="fixed z-50 bottom-24 right-3 left-3 sm:left-auto sm:right-5 sm:w-[400px] max-h-[72vh] flex flex-col rounded-[26px] bg-ivory border border-sand shadow-soft overflow-hidden animate-rise" role="dialog" aria-label="Salon assistant">
          <div className="plinth text-noir border-b border-noir/10 px-5 py-4 flex items-start justify-between gap-3">
            <div><p className="font-display text-2xl leading-none">Salon assistant</p><p className="text-xs text-noir/60 mt-1.5">AI helper · Lee steps in when it matters</p></div>
            {tag}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${m.role === "user" ? "bg-noir text-ivory rounded-br-md" : "bg-white border border-sand rounded-bl-md"}`}>
                  {m.content}
                  {m.handoff && <p className="mt-2 text-xs text-gold-deep font-semibold">Passed to Lee — expect a text back.</p>}
                  {m.links?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.links.map((l) => <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-semibold text-gold-deep hover:bg-gold hover:text-ivory">{l.label} →</Link>)}</div> : null}
                </div>
              </div>
            ))}
            {msgs.length === 1 && <div className="flex flex-wrap gap-2 pt-1">{STARTERS.map((s) => <button key={s} onClick={() => send(s)} className="chip text-[13px] bg-white">{s}</button>)}</div>}
            {busy && <div className="text-sm text-stone animate-pulse">Thinking…</div>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="border-t border-sand p-3 flex gap-2 bg-white">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about prices, times, parking…" className="input !py-2.5" aria-label="Message" />
            <button className="btn-dark !px-4 !py-2.5" disabled={busy || !text.trim()}>Send</button>
          </form>
          <p className="px-4 pb-3 bg-white text-[11px] text-stone">An AI assistant can get things wrong. For anything important, text Lee at 208-466-5500.</p>
        </div>
      )}
    </>
  );
}
