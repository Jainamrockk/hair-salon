import { OwnerHeader, Panel } from "@/components/owner/ui";
import { CATEGORIES } from "@/lib/content";
import { getServices } from "@/lib/data";
import { ownerSaveService } from "@/app/actions";

export const metadata = { title: "Prices" };
function Row({ s }: { s?: { id: number; category: string; name: string; duration_min: number; price_cents: number; price_label: string | null; note: string | null; active: boolean } }) {
  return (
    <form action={ownerSaveService} className="grid grid-cols-2 md:grid-cols-[1.6fr_110px_90px_100px_1fr_70px_auto] gap-2 items-center py-3 border-b border-sand/70">
      <input type="hidden" name="id" value={s?.id ?? ""} />
      {!s && <select name="category" className="input !py-2 col-span-2 md:col-span-7" aria-label="Category">{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
      {s && <input type="hidden" name="category" value={s.category} />}
      <input name="name" defaultValue={s?.name} placeholder="Service name" className="input !py-2 col-span-2 md:col-span-1" required aria-label="Name" />
      <label className="flex items-center gap-1 text-sm"><input name="duration" type="number" min={5} step={5} defaultValue={s?.duration_min ?? 30} className="input !py-2" aria-label="Minutes" />min</label>
      <label className="flex items-center gap-1 text-sm">$<input name="price" type="number" min={0} step={1} defaultValue={s ? s.price_cents / 100 : ""} className="input !py-2" required aria-label="Price" /></label>
      <input name="label" defaultValue={s?.price_label ?? ""} placeholder="and up" className="input !py-2" aria-label="Price label" />
      <input name="note" defaultValue={s?.note ?? ""} placeholder="Note" className="input !py-2" aria-label="Note" />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={s ? s.active : true} className="h-4 w-4" />Live</label>
      <button className="btn-ghost btn-sm">{s ? "Save" : "Add"}</button>
    </form>
  );
}
export default async function Menu() {
  const services = await getServices(true);
  return (
    <>
      <OwnerHeader eyebrow="Setup" title="Prices & services" tag="setup" />
      <div className="space-y-6">
        <Panel className="p-6 bg-noir text-ivory border-noir"><p className="font-display text-2xl">Add a service</p><div className="[&_.input]:!bg-ivory [&_.input]:!text-noir"><Row /></div></Panel>
        {CATEGORIES.map((c) => (
          <Panel key={c.id} className="p-6">
            <p className="font-display text-2xl flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ background: c.hex }} />{c.shade} · {c.name}</p>
            <div className="mt-2">{services.filter((s) => s.category === c.id).map((s) => <Row key={s.id} s={s} />)}</div>
          </Panel>
        ))}
      </div>
    </>
  );
}
