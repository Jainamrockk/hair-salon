import { OwnerHeader, Panel, Stat } from "@/components/owner/ui";
import { q } from "@/lib/db";
import { fmtDate } from "@/lib/time";
import { ownerReplyReview } from "@/app/actions";

export const metadata = { title: "Reviews" };
export default async function OwnerReviews() {
  const rows = await q<{ id: number; author: string; rating: number; body: string; service: string; reply: string | null; created_at: string }>(`SELECT * FROM reviews ORDER BY (reply IS NULL) DESC, created_at DESC`);
  const avg = rows.reduce((a, r) => a + r.rating, 0) / Math.max(1, rows.length);
  return (
    <>
      <OwnerHeader title="Reviews" tag="reviews" />
      <div className="grid grid-cols-3 gap-4 mb-8"><Stat label="Average on Google" value={avg.toFixed(1)} /><Stat label="Reviews" value={rows.length} /><Stat label="Waiting for a reply" value={rows.filter((r) => !r.reply).length} /></div>
      <div className="space-y-4">
        {rows.map((r) => (
          <Panel key={r.id} className="p-6">
            <div className="flex justify-between gap-3"><p className="font-semibold">{r.author} <span className="text-gold ml-2">{"★".repeat(r.rating)}</span></p><p className="text-sm text-taupe">{fmtDate(r.created_at)} · {r.service}</p></div>
            <p className="font-display text-2xl mt-2">“{r.body}”</p>
            <form action={ownerReplyReview} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input type="hidden" name="id" value={r.id} />
              <input name="reply" defaultValue={r.reply ?? ""} className="input" placeholder={`Thank you so much, ${r.author.split(" ")[0]}! …`} aria-label="Reply" />
              <button className="btn-dark btn-sm shrink-0">{r.reply ? "Update reply" : "Post reply"}</button>
            </form>
          </Panel>
        ))}
      </div>
      <p className="text-xs text-stone mt-6">Live sync with Google Business Profile is part of the reviews add-on; until connected, reviews are managed here.</p>
    </>
  );
}
