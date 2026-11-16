import { clientId } from "@/lib/auth";
import { one } from "@/lib/db";
import { deleteMyData, updateClientSettings } from "@/app/actions";
import { fmtPhone } from "@/lib/data";

export const metadata = { title: "Settings" };
export default async function Settings() {
  const cid = (await clientId())!;
  const me = await one<{ first_name: string; last_name: string | null; phone: string; email: string | null; marketing: boolean }>(`SELECT * FROM clients WHERE id = $1`, [cid]);
  return (
    <div className="space-y-10 max-w-2xl">
      <h1 className="font-display text-5xl font-light">Settings</h1>
      <form action={updateClientSettings} className="card p-8 bg-white space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label" htmlFor="f">First name</label><input id="f" name="first" className="input" defaultValue={me?.first_name} /></div>
          <div><label className="label" htmlFor="l">Last name</label><input id="l" name="last" className="input" defaultValue={me?.last_name ?? ""} /></div>
        </div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" name="email" type="email" className="input" defaultValue={me?.email ?? ""} /></div>
        <div><p className="label">Mobile</p><p>{fmtPhone(me!.phone)} <span className="text-sm text-taupe">— to change it, text Lee from the new number.</span></p></div>
        <label className="flex items-center gap-3"><input type="checkbox" name="marketing" defaultChecked={me?.marketing} className="h-5 w-5" />Text me offers and open-slot alerts</label>
        <button className="btn-dark btn-sm">Save</button>
      </form>
      <div className="card p-8 bg-white">
        <p className="font-display text-3xl">Your data</p>
        <p className="text-taupe mt-2">Download everything we keep about you, or delete it. Past visit records stay for tax purposes, without your notes.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <a href="/api/my-data" className="btn-ghost btn-sm">Download my data</a>
          <form action={deleteMyData}><button className="btn btn-sm bg-danger text-ivory">Delete my data</button></form>
        </div>
      </div>
    </div>
  );
}
