import { OwnerHeader } from "@/components/owner/ui";
import RulesEditor from "@/components/owner/RulesEditor";
import { getRules } from "@/lib/data";

export const metadata = { title: "Booking rules" };
export default async function Rules() {
  return (
    <>
      <OwnerHeader eyebrow="Setup" title="Booking rules" tag="setup" />
      <RulesEditor initial={await getRules()} />
    </>
  );
}
