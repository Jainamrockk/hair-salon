import Link from "next/link";
import { OwnerHeader } from "@/components/owner/ui";
import PhotoManager from "@/components/owner/PhotoManager";
import { BUILT_IN, SLOTS, getPhotos, getReel, getWork, listMedia } from "@/lib/photos";
import { q } from "@/lib/db";

export const metadata = { title: "Photos" };
export default async function Photos() {
  const [photos, media, work, reel, products] = await Promise.all([
    getPhotos(), listMedia(), getWork(), getReel(),
    q<{ slug: string; brand: string; name: string; image: string }>(`SELECT slug, brand, name, image FROM products ORDER BY id`),
  ]);
  return (
    <>
      <OwnerHeader eyebrow="Website" title="Photos" tag="photo-manager"><Link href="/" target="_blank" className="btn-ghost btn-sm">View site ↗</Link></OwnerHeader>
      <PhotoManager slots={SLOTS.map((s) => ({ ...s, src: photos[s.key] }))} media={media} builtIn={BUILT_IN} work={work} reel={reel} products={products} />
    </>
  );
}
