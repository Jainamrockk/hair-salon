import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Assistant from "@/components/Assistant";
import FeatureTag from "@/components/FeatureTag";
import Loader from "@/components/Loader";
import ScissorCursor from "@/components/hair/ScissorCursor";
import { getSite } from "@/lib/data";
import { clientId } from "@/lib/auth";
import { getUi } from "@/lib/ui";
import DesignHeader from "@/components/design/DesignHeader";
import DesignFooter from "@/components/design/DesignFooter";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, cid, ui] = await Promise.all([getSite(), clientId(), getUi()]);
  const design = ui === "design";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] btn-dark">Skip to content</a>
      {design ? null : <Loader />}
      {design ? <DesignHeader announcement={site.announcement} signedIn={!!cid} /> : <Header announcement={site.announcement} signedIn={!!cid} />}
      {site.holidayNote ? <div className="border-b border-gold/30 bg-gold/10 text-center text-sm py-2.5 px-4 text-gold">{site.holidayNote}</div> : null}
      <main id="main">{children}</main>
      {design ? <DesignFooter /> : <Footer />}
      {design ? null : <ScissorCursor />}
      <Assistant tag={<FeatureTag id="assistant" />} />
    </>
  );
}
