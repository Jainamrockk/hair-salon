import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Assistant from "@/components/Assistant";
import FeatureTag from "@/components/FeatureTag";
import Loader from "@/components/Loader";
import ScissorCursor from "@/components/hair/ScissorCursor";
import { getSite } from "@/lib/data";
import { clientId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, cid] = await Promise.all([getSite(), clientId()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] btn-dark">Skip to content</a>
      <Loader />
      <Header announcement={site.announcement} signedIn={!!cid} />
      {site.holidayNote ? <div className="border-b border-gold/30 bg-gold/10 text-center text-sm py-2.5 px-4 text-gold">{site.holidayNote}</div> : null}
      <main id="main">{children}</main>
      <Footer />
      <ScissorCursor />
      <Assistant tag={<FeatureTag id="assistant" />} />
    </>
  );
}
