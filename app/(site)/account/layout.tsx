import Link from "next/link";
import SignIn from "@/components/account/SignIn";
import FeatureTag from "@/components/FeatureTag";
import { clientId } from "@/lib/auth";
import { one } from "@/lib/db";
import { fmtPhone } from "@/lib/data";
import { fmtDate } from "@/lib/time";
import { signOutClient } from "@/app/actions";
import AccountNav from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const cid = await clientId();
  const me = cid ? await one<{ first_name: string; phone: string; created_at: string }>(`SELECT first_name, phone, created_at FROM clients WHERE id = $1`, [cid]) : undefined;
  if (!me) return <><div className="container-x pt-8"><FeatureTag id="accounts" /></div><SignIn /></>;
  return (
    <div className="container-x py-12 md:py-16 grid lg:grid-cols-12 gap-10">
      <aside className="lg:col-span-3">
        <div className="flex items-center gap-4">
          <span className="h-14 w-14 rounded-full bg-noir text-ivory grid place-items-center font-display text-2xl">{me.first_name[0]}</span>
          <div><p className="font-display text-3xl leading-none">Hi, {me.first_name}.</p><p className="text-sm text-taupe mt-1">{fmtPhone(me.phone)}</p></div>
        </div>
        <p className="text-xs text-stone mt-3">Client since {fmtDate(me.created_at, { month: "long", year: "numeric" })}</p>
        <div className="mt-3"><FeatureTag id="accounts" /></div>
        <AccountNav />
        <form action={signOutClient}><button className="mt-4 text-sm text-taupe underline">Sign out</button></form>
        <Link href="/book" className="btn-dark btn-sm mt-8 hidden lg:inline-flex">Book a visit</Link>
      </aside>
      <div className="lg:col-span-9">{children}</div>
    </div>
  );
}
