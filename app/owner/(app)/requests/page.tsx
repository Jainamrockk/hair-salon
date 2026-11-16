import { OwnerHeader, Panel, Pill } from "@/components/owner/ui";
import RequestRow from "@/components/owner/RequestRow";
import FeatureTag from "@/components/FeatureTag";
import { q } from "@/lib/db";
import { fmtPhone } from "@/lib/data";
import { fmtDate, fmtTime } from "@/lib/time";

export const metadata = { title: "Requests" };
type R = { id: number; kind: string; name: string; phone: string; service: string | null; preferred: string | null; days: string[] | null; times: string[] | null; notes: string | null; status: string; created_at: string };
export default async function Requests() {
  const rows = await q<R>(`SELECT * FROM requests ORDER BY (status = 'new') DESC, created_at DESC`);
  const section = (kind: string, title: string, tag: string) => (
    <section>
      <div className="flex items-center gap-3 mb-4"><h2 className="font-display text-3xl">{title}</h2><FeatureTag id={tag} /></div>
      <div className="grid lg:grid-cols-2 gap-4">
        {rows.filter((r) => r.kind === kind).map((r) => (
          <Panel key={r.id} className="p-6">
            <div className="flex justify-between gap-3"><p className="font-semibold text-lg">{r.name}</p><Pill s={r.status} /></div>
            <p className="text-sm text-taupe">{fmtPhone(r.phone)} · sent {fmtDate(r.created_at)} {fmtTime(r.created_at)}</p>
            <p className="mt-3">{r.service || "Service not specified"}</p>
            <p className="text-sm text-cocoa/80">{r.kind === "waitlist" ? `${(r.days ?? []).join(", ")} · ${(r.times ?? []).join(", ")} · ${r.preferred ?? ""}` : r.preferred}</p>
            {r.notes && <p className="text-sm text-taupe mt-2 whitespace-pre-line border-l-2 border-gold pl-3">{r.notes}</p>}
            <RequestRow id={r.id} status={r.status} kind={r.kind} />
          </Panel>
        ))}
        {!rows.some((r) => r.kind === kind) && <p className="text-taupe">Nothing here.</p>}
      </div>
    </section>
  );
  return (
    <>
      <OwnerHeader title="Requests" />
      <div className="space-y-12">{section("after_hours", "After-hours requests", "after-hours")}{section("waitlist", "Waitlist", "waitlist")}</div>
    </>
  );
}
