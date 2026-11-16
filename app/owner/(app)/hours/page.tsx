import Link from "next/link";
import { OwnerHeader } from "@/components/owner/ui";
import HoursEditor from "@/components/owner/HoursEditor";
import { getHours } from "@/lib/data";

export const metadata = { title: "Hours" };
export default async function Hours() {
  const hours = await getHours();
  return (
    <>
      <OwnerHeader eyebrow="Setup" title="Hours" tag="setup"><Link href="/owner/calendar" className="btn-ghost btn-sm">Block a day off</Link></OwnerHeader>
      <HoursEditor initial={hours} />
    </>
  );
}
