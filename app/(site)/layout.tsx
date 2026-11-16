import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Assistant from "@/components/Assistant";
import FeatureTag from "@/components/FeatureTag";
import { getSite } from "@/lib/data";
import { clientId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, cid] = await Promise.all([getSite(), clientId()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] btn-dark">Skip to content</a>
      <Header announcement={site.announcement} signedIn={!!cid} />
      {site.holidayNote ? <div className="bg-gold/15 border-b border-gold/30 text-center text-sm py-2.5 px-4 text-gold-deep">{site.holidayNote}</div> : null}
      <main id="main">{children}</main>
      <Footer />
      <Assistant tag={<FeatureTag id="assistant" />} />
    </>
  );
}
