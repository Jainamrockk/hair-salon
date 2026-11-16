import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import { WaitlistForm } from "@/components/booking/RequestForms";

export const metadata = { title: "Join the waitlist" };
export default async function Waitlist({ searchParams }: { searchParams: Promise<{ service?: string; min?: string }> }) {
  const { service, min } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Waitlist" tag={<FeatureTag id="waitlist" />} title={<>First to know <em>when a chair opens.</em></>} lead="Lee's week fills fast. Tell us when you're free and we'll text you the moment a matching time opens." />
      <div className="container-x pb-28 max-w-3xl"><WaitlistForm service={service} minutes={min ? Number(min) : undefined} /></div>
    </>
  );
}
