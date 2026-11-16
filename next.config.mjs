/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  images: { unoptimized: true },
  // Owner photo uploads are resized in the browser to ~1–2 MB; leave headroom under Vercel's 4.5 MB request cap.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};
export default nextConfig;
