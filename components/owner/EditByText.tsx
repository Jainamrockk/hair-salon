"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ownerDraftChange, ownerPublishChange } from "@/app/actions";
import type { SiteDraft } from "@/lib/edit-by-text";

const EXAMPLES = ["Change Thursday hours to 10 to 2", "Change the price of toner to $45", "Set the special to Free brow wax with any color this week", "Add a holiday note: Closed Nov 26–27 for Thanksgiving", "Add new service Scalp facial, 30 min, $40 treatments", "Close on Saturday"];

export default function EditByText() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<SiteDraft | null>(null);
  const [done, setDone] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[22px] bg-white border border-sand p-6 md:p-8">
      <p className="font-display text-3xl">Tell me what to change</p>
      <p className="text-taupe mt-1">Say it the way you&apos;d say it to a friend. I&apos;ll draft the change and show you exactly how it looks. Nothing goes live until you tap publish.</p>
      <form className="mt-5 flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); setDone(""); start(async () => setDraft(await ownerDraftChange(text))); }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Change Thursday hours to 10–1" aria-label="What to change" />
        <button className="btn-dark shrink-0" disabled={!text || pending}>{pending ? "Drafting…" : "Draft the change"}</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">{EXAMPLES.map((x) => <button key={x} onClick={() => setText(x)} className="chip !py-1.5 !text-xs">{x}</button>)}</div>
      {draft && (draft.ok ? (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/5 p-5">
          <p className="eyebrow-gold">Check the change</p>
          <p className="font-display text-2xl mt-1">{draft.summary}</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
            <div className="rounded-xl bg-white border border-sand p-4"><p className="label">Now</p><p className="line-through text-taupe">{draft.before}</p></div>
            <div className="rounded-xl bg-white border border-noir p-4"><p className="label">After publish</p><p className="font-semibold">{draft.after}</p></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-gold btn-sm" disabled={pending} onClick={() => start(async () => { const r = await ownerPublishChange(draft); if (r.ok) { setDone(draft.summary); setDraft(null); setText(""); router.refresh(); } })}>Publish</button>
            <button className="btn-ghost btn-sm" onClick={() => setDraft(null)}>Discard</button>
          </div>
        </div>
      ) : <p className="mt-5 rounded-xl bg-cream p-4 text-sm">{draft.message}</p>)}
      {done && <p className="mt-5 text-emerald-500">Published: {done}. It&apos;s live on salonche.com.</p>}
    </div>
  );
}
