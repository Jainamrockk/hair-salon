import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { q } from "@/lib/db";
import OwnerNav from "@/components/owner/OwnerNav";
import { getUi } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Owner", template: "%s · Owner · Salon Ché" }, robots: { index: false } };

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  if (!(await isOwner())) redirect("/owner/sign-in");
  const [c] = await q<{ msgs: number; reqs: number; revs: number; orders: number }>(`SELECT
    (SELECT COUNT(DISTINCT client_id)::int FROM messages WHERE sender = 'client' AND NOT read) AS msgs,
    (SELECT COUNT(*)::int FROM requests WHERE status = 'new') AS reqs,
    (SELECT COUNT(*)::int FROM reviews WHERE reply IS NULL) AS revs,
    (SELECT COUNT(*)::int FROM orders WHERE status IN ('reserved','ready')) AS orders`);
  return (
    <div className="theme-pearl min-h-screen bg-ivory lg:grid lg:grid-cols-[260px_1fr]">
      <OwnerNav counts={c} ui={await getUi()} />
      <main className="min-w-0 px-5 md:px-10 py-8 md:py-10 pb-28">{children}</main>
    </div>
  );
}
