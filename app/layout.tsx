import type { Metadata, Viewport } from "next";
import "@fontsource/italiana/400.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./globals.css";
import { getUi } from "@/lib/ui";

export const metadata: Metadata = {
  title: { default: "Salon Ché — Hair · Color · Barber in Nampa, Idaho", template: "%s · Salon Ché" },
  description: "Cuts, creative color, perms and waxing for her and for him by Lee Ortivez — 34 years behind the chair. 507 Almond Street, Nampa. Book online, even after hours.",
  openGraph: { title: "Salon Ché — Let it shine.", description: "Hair, color and barber services by Lee Ortivez in Nampa, Idaho.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#15110f" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ui = await getUi();
  return (
    <html lang="en" className={ui === "design" ? "ui-design" : undefined}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
