import Link from "next/link";
import { OwnerHeader, Panel } from "@/components/owner/ui";
import EditByText from "@/components/owner/EditByText";
import { q } from "@/lib/db";
import { fmtDate } from "@/lib/time";
import { ownerUndoChange } from "@/app/actions";
import { SALON } from "@/lib/content";

export const metadata = { title: "Website" };
export default async function Website() {
  const changes = await q<{ id: number; summary: string; undone: boolean; before: unknown; created_at: string }>(`SELECT id, summary, undone, before, created_at FROM site_changes ORDER BY created_at DESC LIMIT 12`);
  return (
    <>
      <OwnerHeader eyebrow="Live · salonche.com" title="Website" tag="edit-by-text">
        <Link href="/" target="_blank" className="btn-ghost btn-sm">View site ↗</Link>
        <Link href="/owner/settings" className="btn-ghost btn-sm">Edit by cards</Link>
      </OwnerHeader>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <EditByText />
          <Panel className="p-6">
            <p className="font-display text-2xl">Quick edits</p>
            <div className="grid sm:grid-cols-4 gap-3 mt-4">
              {[["/owner/hours", "Hours"], ["/owner/menu", "Prices"], ["/owner/settings", "Top-bar note"], ["/owner/settings", "Homepage text"]].map(([h, l]) => <Link key={l} href={h} className="rounded-2xl border border-sand p-4 hover:border-noir font-semibold">{l} →</Link>)}
            </div>
          </Panel>
          <Panel className="p-6 bg-noir text-ivory border-noir">
            <p className="font-display text-2xl">Edit by text message</p>
            <p className="text-ivory/70 text-sm mt-2">Text your change from your own phone to the salon number (e.g. “Closed Friday, family wedding”) and you&apos;ll get a preview link back to approve. Works once the text-message add-on is connected.</p>
            <p className="mt-3 font-display text-3xl text-gold-light">{SALON.phone}</p>
          </Panel>
        </div>
        <Panel className="p-6 self-start">
          <p className="font-display text-2xl">Recent changes</p>
          <ul className="mt-4 divide-y divide-sand">
            {changes.map((c) => (
              <li key={c.id} className="py-3 flex justify-between gap-3">
                <div><p className={c.undone ? "line-through text-taupe" : ""}>{c.summary}</p><p className="text-xs text-stone">{fmtDate(c.created_at)}</p></div>
                {!c.undone && c.before ? <form action={ownerUndoChange.bind(null, c.id)}><button className="text-sm underline text-taupe">Undo</button></form> : null}
              </li>
            ))}
            {!changes.length && <li className="py-3 text-taupe">No changes yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
