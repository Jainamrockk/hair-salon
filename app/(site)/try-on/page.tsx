import Link from "next/link";
import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import TryOnStudio from "@/components/TryOnStudio";
import StyleStudio from "@/components/hair/StyleStudio";
import StyleFinder from "@/components/hair/StyleFinder";

export const metadata = { title: "Virtual try-on" };
const MODES = [["style", "Hairstyles"], ["colour", "Colour"], ["finder", "Face-shape finder"]] as const;

export default async function TryOn({ searchParams }: { searchParams: Promise<{ mode?: string; style?: string }> }) {
  const sp = await searchParams;
  const mode = MODES.some(([m]) => m === sp.mode) ? sp.mode! : "style";
  return (
    <>
      <PageHero eyebrow="Virtual try-on" tag={<FeatureTag id="try-on" />} title={<>Try the cut <em>before the chair.</em></>}
        lead="Put twelve of Lee's signature cuts on your own selfie, turn yourself into a caricature, preview real salon shades, or find the cut that suits your face." />
      <div className="container-x pb-28">
        <nav className="flex flex-wrap gap-2 mb-10" aria-label="Try-on mode">
          {MODES.map(([m, l]) => <Link key={m} href={`/try-on?mode=${m}`} scroll={false} className={`chip ${mode === m ? "chip-on" : ""}`}>{l}</Link>)}
        </nav>
        {mode === "style" && <StyleStudio initialStyle={sp.style} />}
        {mode === "colour" && <TryOnStudio />}
        {mode === "finder" && <StyleFinder />}
      </div>
    </>
  );
}
