import Link from "next/link";
import PageHero from "@/components/PageHero";
import { DAY_LABEL, SALON, directionsUrl, mapEmbedUrl } from "@/lib/content";
import { getHours } from "@/lib/data";
import { fmtMin, hhmmToMin, localDate, localMinutes, weekdayKey } from "@/lib/time";

export const metadata = { title: "Visit" };
export default async function Visit() {
  const hours = await getHours();
  const today = weekdayKey(localDate());
  const th = (hours as any)[today];
  const now = localMinutes(new Date());
  const openNow = th && now >= hhmmToMin(th.open) && now < hhmmToMin(th.close);
  return (
    <>
      <PageHero eyebrow="Visit" title={<>{SALON.street}, <em>Nampa.</em></>} lead="A calm, street-level salon in South Nampa with free parking right out front.">
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${openNow ? "bg-emerald-500" : "bg-rose"}`} />{openNow ? `Open now · until ${fmtMin(hhmmToMin(th.close))}` : "Closed now"}</p>
      </PageHero>
      <div className="container-x pb-28 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 rounded-[28px] overflow-hidden border border-sand min-h-[480px]">
          <iframe title="Map to Salon Ché" src={mapEmbedUrl} className="w-full h-full min-h-[480px] grayscale-[60%]" loading="lazy" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-8">
            <p className="eyebrow mb-4">Hours</p>
            <ul className="divide-y divide-sand">{["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => { const h = (hours as any)[d]; return (
              <li key={d} className={`flex justify-between py-3 ${d === today ? "font-semibold" : ""}`}><span>{DAY_LABEL[d]}{d === today ? " · Today" : ""}</span><span className="tabular-nums">{h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed"}</span></li>
            ); })}</ul>
            <p className="text-sm text-taupe mt-4">After hours by appointment. <Link href="/book/request" className="underline">Request a time</Link>.</p>
          </div>
          <div className="card p-8 bg-noir text-ivory border-noir">
            <p className="eyebrow-gold mb-4">Getting here</p>
            <ul className="space-y-3 text-ivory/80">
              <li>✦ Free parking directly out front</li><li>✦ Street-level entrance, no steps</li><li>✦ One guest at a time — quiet and unhurried</li><li>✦ Please arrive 5 minutes early for color</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3"><a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-gold btn-sm">Get directions</a><a href={SALON.phoneHref} className="btn-ghost-light btn-sm">Call</a><a href={SALON.smsHref} className="btn-ghost-light btn-sm">Text</a></div>
          </div>
        </div>
      </div>
    </>
  );
}
