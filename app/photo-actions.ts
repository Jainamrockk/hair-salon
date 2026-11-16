"use server";
import { revalidatePath } from "next/cache";
import { isOwner } from "@/lib/auth";
import { one, q } from "@/lib/db";
import { saveSetting } from "@/lib/data";
import { SLOTS, getReel, getWork, type GalleryItem } from "@/lib/photos";

async function guard() { if (!(await isOwner())) throw new Error("Not signed in"); }
const MAX_BYTES = 3_000_000;
const OK_MIME = ["image/jpeg", "image/png", "image/webp"];
// Accept only our own uploads or the photos that ship with the site.
const validSrc = (s: string) => /^\/api\/media\/\d+$/.test(s) || /^\/photos\/[a-z0-9-]+\.jpg$/.test(s);

function refreshSite() {
  revalidatePath("/", "layout");
  revalidatePath("/owner/photos");
}

/** Stores a photo already resized in the browser. Returns its URL. */
export async function uploadPhoto(input: { name: string; mime: string; b64: string; width: number; height: number }) {
  await guard();
  if (!OK_MIME.includes(input.mime)) return { ok: false as const, error: "Use a JPG, PNG or WebP photo." };
  const bytes = Math.floor((input.b64.length * 3) / 4);
  if (bytes > MAX_BYTES) return { ok: false as const, error: "That photo is too large even after resizing. Try a smaller one." };
  const r = await one<{ id: number }>(
    `INSERT INTO media (name, mime, data_b64, width, height, bytes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [input.name.slice(0, 120), input.mime, input.b64, Math.round(input.width), Math.round(input.height), bytes]);
  revalidatePath("/owner/photos");
  return { ok: true as const, id: r!.id, url: `/api/media/${r!.id}` };
}

export async function setSlotPhoto(slot: string, src: string | null) {
  await guard();
  if (!SLOTS.some((s) => s.key === slot)) throw new Error("Unknown slot");
  if (src && !validSrc(src)) throw new Error("Invalid photo");
  const cur = (await one<{ value: Record<string, string> }>(`SELECT value FROM settings WHERE key = 'photos'`))?.value ?? {};
  if (src) cur[slot] = src; else delete cur[slot];
  await saveSetting("photos", cur);
  const label = SLOTS.find((s) => s.key === slot)!.label;
  await q(`INSERT INTO site_changes (summary, key, before, after) VALUES ($1,'photos',NULL,$2::jsonb)`, [src ? `Changed photo: ${label}` : `Reset photo: ${label}`, JSON.stringify({ slot, src })]);
  refreshSite();
}

function clean(items: GalleryItem[]) {
  return items.filter((i) => validSrc(i.src)).slice(0, 40).map((i) => ({ src: i.src, title: String(i.title || "").slice(0, 80), cat: String(i.cat || "").slice(0, 40), s: String(i.s || "").slice(0, 20) }));
}
export async function saveGallery(which: "work" | "reel", items: GalleryItem[]) {
  await guard();
  await saveSetting(which, clean(items));
  refreshSite();
}
export async function resetGallery(which: "work" | "reel") {
  await guard();
  await q(`DELETE FROM settings WHERE key = $1`, [which]);
  refreshSite();
}

export async function setProductPhoto(slug: string, src: string) {
  await guard();
  if (!validSrc(src)) throw new Error("Invalid photo");
  await q(`UPDATE products SET image = $2 WHERE slug = $1`, [slug, src]);
  revalidatePath("/shop", "layout");
  refreshSite();
}

/** Deletes an upload only if nothing on the site still uses it. */
export async function deletePhoto(id: number) {
  await guard();
  const url = `/api/media/${id}`;
  const photos = (await one<{ value: Record<string, string> }>(`SELECT value FROM settings WHERE key = 'photos'`))?.value ?? {};
  const [work, reel] = await Promise.all([getWork(), getReel()]);
  const prod = await one(`SELECT 1 FROM products WHERE image = $1`, [url]);
  if (Object.values(photos).includes(url) || work.some((w) => w.src === url) || reel.some((w) => w.src === url) || prod)
    return { ok: false as const, error: "This photo is still on the site. Replace it there first, then delete it." };
  await q(`DELETE FROM media WHERE id = $1`, [id]);
  revalidatePath("/owner/photos");
  return { ok: true as const };
}
