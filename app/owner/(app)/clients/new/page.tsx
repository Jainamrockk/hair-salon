import { OwnerHeader, Panel } from "@/components/owner/ui";
import { ownerSaveClient } from "@/app/actions";

export const metadata = { title: "Add a client" };
export default function NewClient() {
  return (
    <>
      <OwnerHeader title="Add a client" tag="owner-app" />
      <Panel className="p-6 md:p-8 max-w-2xl">
        <form action={ownerSaveClient} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label" htmlFor="f">First name</label><input id="f" name="first" className="input" required /></div>
            <div><label className="label" htmlFor="l">Last name</label><input id="l" name="last" className="input" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label" htmlFor="p">Mobile</label><input id="p" name="phone" className="input" inputMode="tel" required /></div>
            <div><label className="label" htmlFor="e">Email</label><input id="e" name="email" type="email" className="input" /></div>
          </div>
          <div><label className="label" htmlFor="n">Notes</label><textarea id="n" name="notes" rows={3} className="input" placeholder="Formula, preferences, how they found you" /></div>
          <div><label className="label" htmlFor="a">Allergies / patch test</label><input id="a" name="allergies" className="input" /></div>
          <button className="btn-dark">Save client</button>
        </form>
      </Panel>
    </>
  );
}
