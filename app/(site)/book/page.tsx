import BookingFlow from "@/components/booking/BookingFlow";
import FeatureTag from "@/components/FeatureTag";
import { CATEGORIES } from "@/lib/content";
import { getRules, getServices } from "@/lib/data";
import { clientId } from "@/lib/auth";
import { one } from "@/lib/db";

export const metadata = { title: "Book an appointment" };

export default async function Book({ searchParams }: { searchParams: Promise<{ s?: string; cat?: string; date?: string }> }) {
  const sp = await searchParams;
  const [services, rules, cid] = await Promise.all([getServices(), getRules(), clientId()]);
  const me = cid ? await one<{ first_name: string; phone: string }>(`SELECT first_name, phone FROM clients WHERE id = $1`, [cid]) : undefined;
  const ids = (sp.s || "").split(",").map(Number).filter((n) => services.some((s) => s.id === n));
  const tags = Object.fromEntries(["after-hours", "waitlist", "consultation", "sms", "deposits"].map((k) => [k, <FeatureTag key={k} id={k} />]));
  return (
    <>
      <div className="container-x pt-8 flex items-center gap-3"><FeatureTag id="booking" /></div>
      <BookingFlow
        services={services}
        categories={CATEGORIES.map((c) => ({ id: c.id, name: c.name, shade: c.shade, shadeName: c.shadeName, hex: c.hex, ink: c.ink }))}
        rules={rules}
        initial={{ ids, cat: sp.cat, date: sp.date, name: me && me.first_name !== "Guest" ? me.first_name : "", phone: me?.phone }}
        tags={tags}
      />
    </>
  );
}
