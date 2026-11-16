import Link from "next/link";
import { OwnerHeader, Panel } from "@/components/owner/ui";
import { q } from "@/lib/db";
import { fmtPhone } from "@/lib/data";
import { fmtDate, money } from "@/lib/time";

export const metadata = { title: "Clients" };
export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: term = "" } = await searchParams;
  const rows = await q<{ id: number; first_name: string; last_name: string | null; phone: string; visits: number; spent: number; last: string | null; next: string | null }>(
    `SELECT c.id, c.first_name, c.last_name, c.phone,
      COUNT(a.id) FILTER (WHERE a.status = 'completed')::int AS visits,
      COALESCE(SUM(a.paid_cents) FILTER (WHERE a.status = 'completed'), 0)::int AS spent,
      MAX(a.starts_at) FILTER (WHERE a.starts_at < NOW()) AS last,
      MIN(a.starts_at) FILTER (WHERE a.starts_at >= NOW() AND a.status IN ('confirmed','pending')) AS next
     FROM clients c LEFT JOIN appointments a ON a.client_id = c.id
     WHERE c.first_name <> 'Deleted' AND ($1 = '' OR (c.first_name || ' ' || COALESCE(c.last_name,'') || ' ' || c.phone) ILIKE '%' || $1 || '%')
     GROUP BY c.id ORDER BY c.first_name`, [term]);
  return (
    <>
      <OwnerHeader title="Clients" tag="owner-app"><Link href="/owner/clients/new" className="btn-dark btn-sm">Add a client</Link></OwnerHeader>
      <form className="mb-6"><input name="q" defaultValue={term} className="input max-w-md" placeholder="Search name or phone…" aria-label="Search clients" /></form>
      <Panel className="overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead><tr className="text-[11px] tracking-[0.02em] text-taupe border-b border-sand"><th className="p-4">Client</th><th className="p-4">Phone</th><th className="p-4">Visits</th><th className="p-4">Spent</th><th className="p-4">Last visit</th><th className="p-4">Next</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-sand/60 hover:bg-cream/50">
                <td className="p-4"><Link href={`/owner/clients/${r.id}`} className="flex items-center gap-3 font-semibold"><span className="h-9 w-9 rounded-full bg-noir text-ivory grid place-items-center font-display">{r.first_name[0]}</span>{r.first_name} {r.last_name}</Link></td>
                <td className="p-4 text-taupe">{fmtPhone(r.phone)}</td><td className="p-4">{r.visits}</td><td className="p-4">{money(r.spent)}</td>
                <td className="p-4 text-taupe">{r.last ? fmtDate(r.last) : "—"}</td><td className="p-4">{r.next ? fmtDate(r.next) : "—"}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-taupe">No clients match “{term}”.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
