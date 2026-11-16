import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Salon Ché — Hair · Color · Barber in Nampa, Idaho", template: "%s · Salon Ché" },
  description: "Cuts, creative color, perms and waxing for her and for him by Lee Ortivez — 34 years behind the chair. 507 Almond Street, Nampa. Book online, even after hours.",
  openGraph: { title: "Salon Ché — Let it shine.", description: "Hair, color and barber services by Lee Ortivez in Nampa, Idaho.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#15110F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
