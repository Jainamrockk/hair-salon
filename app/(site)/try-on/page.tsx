import Link from "next/link";
import PageHero from "@/components/PageHero";
import FeatureTag from "@/components/FeatureTag";
import TryOnStudio from "@/components/TryOnStudio";
import StyleStudio from "@/components/hair/StyleStudio";
import StyleFinder from "@/components/hair/StyleFinder";
import LiveStudio from "@/components/hair/live/LiveStudio";

export const metadata = { title: "Virtual try-on" };
const MODES = [["live", "Live mirror"], ["style", "Cartoon studio"], ["colour", "Colour on a photo"], ["finder", "Face-shape finder"]] as const;

export default async function TryOn({ searchParams }: { searchParams: Promise<{ mode?: string; style?: string }> }) {
  const sp = await searchParams;
  const mode = MODES.some(([m]) => m === sp.mode) ? sp.mode! : "live";
  return (
    <>
      <PageHero eyebrow="Virtual try-on" tag={<FeatureTag id="try-on" />} title={<>Try the cut <em>before the chair.</em></>}
        lead="Turn on your camera and see yourself live in twelve of Lee's signature cuts — or recolour your own hair in real time. Prefer fun? Try the cartoon studio." />
      <div className="container-x pb-28">
        <nav className="flex flex-wrap gap-2 mb-10" aria-label="Try-on mode">
          {MODES.map(([m, l]) => <Link key={m} href={`/try-on?mode=${m}`} scroll={false} className={`chip ${mode === m ? "chip-on" : ""}`}>{l}</Link>)}
        </nav>
        {mode === "live" && <LiveStudio initialStyle={sp.style} />}
        {mode === "style" && <StyleStudio initialStyle={sp.style} />}
        {mode === "colour" && <TryOnStudio />}
        {mode === "finder" && <StyleFinder />}
      </div>
    </>
  );
}
