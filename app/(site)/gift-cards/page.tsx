import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import GiftCardBuilder from "@/components/GiftCardBuilder";

export const metadata = { title: "Gift cards" };
export default function GiftCards() {
  return (
    <>
      <PageHero eyebrow="Gift cards" tag={<FeatureTag id="gift-cards" />} title={<>Give a good <em>hair day.</em></>} lead="A Salon Ché gift card is good for any service or product, never expires, and lands by email the moment you buy it." />
      <div className="container-x pb-28"><GiftCardBuilder /></div>
    </>
  );
}
