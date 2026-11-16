import Link from "next/link";
import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import LookBook from "@/components/hair/LookBook";
import StyleFinder from "@/components/hair/StyleFinder";

export const metadata = { title: "The look book" };
export default function Looks() {
  return (
    <>
      <PageHero eyebrow="The look book" tag={<FeatureTag id="try-on" />} title={<>Twelve looks, <em>one chair.</em></>}
        lead="Meet the cast. Every character wears a cut Lee does every week — re-colour them with the shade chart, then try your favourite on your own photo." />
      <div className="container-x pb-24"><LookBook /></div>
      <section className="theme-pearl">
        <div className="container-x py-28">
          <h2 className="h2 max-w-2xl">Not sure what suits you?</h2>
          <p className="lead mt-5 max-w-2xl">Pick the face shape closest to yours. Lee&apos;s rule of thumb: balance it — add width where the face is narrow, length where it&apos;s round.</p>
          <div className="mt-14"><StyleFinder /></div>
        </div>
      </section>
      <section className="container-x py-24 text-center">
        <h2 className="h2">Found the one?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/try-on?mode=style" className="btn-dark">Try it on your photo</Link><Link href="/book" className="btn-ghost">Book with Lee</Link></div>
      </section>
    </>
  );
}
