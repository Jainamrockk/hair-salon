import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import TryOnStudio from "@/components/TryOnStudio";

export const metadata = { title: "Virtual color try-on" };
export default function TryOn() {
  return (
    <>
      <PageHero eyebrow="Virtual try-on" tag={<FeatureTag id="try-on" />} title={<>See the shade <em>before the chair.</em></>} lead="Upload a selfie, tap your hair, and preview real salon shades — all over, as highlights or just at the roots." />
      <div className="container-x pb-28"><TryOnStudio /></div>
    </>
  );
}
