import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import { AfterHoursForm } from "@/components/booking/RequestForms";

export const metadata = { title: "Request an after-hours time" };
export default async function Request({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <>
      <PageHero eyebrow="After hours" tag={<FeatureTag id="after-hours" />} title={<>Can&apos;t make it by 7? <em>Ask.</em></>} lead="Evenings and early mornings, by appointment. Tell Lee what you need and when — you'll get a text back." />
      <div className="container-x pb-28 max-w-3xl"><AfterHoursForm service={service} /></div>
    </>
  );
}
