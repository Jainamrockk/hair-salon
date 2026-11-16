import Link from "next/link";
import { OwnerHeader, Panel } from "@/components/owner/ui";
import { getSite } from "@/lib/data";
import { SALON } from "@/lib/content";
import { ownerSaveSite, ownerSignOut } from "@/app/actions";

export const metadata = { title: "Salon settings" };
export default async function Settings() {
  const site = await getSite();
  const integrations = [
    ["Database", process.env.DATABASE_URL ? "Neon Postgres connected" : "Embedded demo database (set DATABASE_URL)", !!process.env.DATABASE_URL],
    ["Text messages", process.env.TWILIO_ACCOUNT_SID ? "Twilio connected" : "Demo mode — add Twilio keys", !!process.env.TWILIO_ACCOUNT_SID],
    ["Payments", process.env.STRIPE_SECRET_KEY ? "Stripe connected" : "Demo mode — add Stripe keys", !!process.env.STRIPE_SECRET_KEY],
    ["AI assistant", process.env.ANTHROPIC_API_KEY ? "Claude connected" : "Built-in answers — add ANTHROPIC_API_KEY for full AI", !!process.env.ANTHROPIC_API_KEY],
  ] as const;
  return (
    <>
      <OwnerHeader eyebrow="Setup" title="Salon settings"><form action={ownerSignOut}><button className="btn-ghost btn-sm">Sign out</button></form></OwnerHeader>
      <div className="grid xl:grid-cols-2 gap-6">
        <Panel className="p-6 md:p-8">
          <div className="flex justify-between items-start"><p className="font-display text-3xl">Website text · by cards</p><Link href="/owner/website" className="text-sm underline text-taupe">Or edit by text →</Link></div>
          <form action={ownerSaveSite} className="space-y-4 mt-6">
            <div><label className="label" htmlFor="an">Top-bar note</label><input id="an" name="announcement" defaultValue={site.announcement} className="input" /></div>
            <div><label className="label" htmlFor="hn">Holiday note</label><input id="hn" name="holidayNote" defaultValue={site.holidayNote} className="input" placeholder="e.g. Closed Nov 26–27 for Thanksgiving" /></div>
            <div><label className="label" htmlFor="ht">Homepage headline</label><input id="ht" name="heroTitle" defaultValue={site.heroTitle} className="input" /></div>
            <div><label className="label" htmlFor="hl">Homepage intro</label><textarea id="hl" name="heroLead" rows={3} defaultValue={site.heroLead} className="input" /></div>
            <div><label className="label" htmlFor="al">About Lee</label><textarea id="al" name="aboutLead" rows={3} defaultValue={site.aboutLead} className="input" /></div>
            <button className="btn-dark">Publish</button>
          </form>
        </Panel>
        <div className="space-y-6">
          <Panel className="p-6 md:p-8">
            <p className="font-display text-3xl">Salon details</p>
            <dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-taupe">Name</dt><dd>{SALON.name}</dd><dt className="text-taupe">Address</dt><dd>{SALON.street}, {SALON.city}</dd>
              <dt className="text-taupe">Phone</dt><dd>{SALON.phone}</dd><dt className="text-taupe">Email</dt><dd>{SALON.email}</dd><dt className="text-taupe">Time zone</dt><dd>Mountain (America/Boise)</dd>
            </dl>
          </Panel>
          <Panel className="p-6 md:p-8">
            <p className="font-display text-3xl">Connections</p>
            <ul className="mt-4 space-y-3">{integrations.map(([n, s, ok]) => (
              <li key={n} className="flex items-center justify-between gap-3"><span className="font-semibold">{n}</span><span className={`text-sm flex items-center gap-2 ${ok ? "text-emerald-700" : "text-amber-700"}`}><span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />{s}</span></li>
            ))}</ul>
          </Panel>
          <Panel className="p-6 md:p-8"><p className="font-display text-3xl">Feature pricing</p><p className="text-sm text-taupe mt-2">Add-on tags are visible on the site while you review the proposal.</p><Link href="/features" className="btn-ghost btn-sm mt-4">See features & pricing</Link></Panel>
        </div>
      </div>
    </>
  );
}
