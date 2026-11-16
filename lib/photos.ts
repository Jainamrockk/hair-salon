import "server-only";
import { CATEGORIES, CATEGORY_PHOTO, IMG } from "./content";
import { one, q } from "./db";

/**
 * Every place on the website that shows a photo. Lee can replace any of them from Owner → Photos;
 * a slot with no override shows its built-in default.
 */
export type Slot = { key: string; group: string; label: string; hint: string; def: string; shape: "arch" | "wide" };
export type GalleryItem = { src: string; title: string; cat: string; s: string };

export const SLOTS: Slot[] = [
  { key: "hero1", group: "Homepage", label: "Hero — left arch", hint: "A colour look. Portrait, hair clearly visible.", def: IMG.color, shape: "arch" },
  { key: "hero2", group: "Homepage", label: "Hero — centre arch", hint: "The signature shot. Tall portrait.", def: IMG.blonde, shape: "arch" },
  { key: "hero3", group: "Homepage", label: "Hero — right arch", hint: "A barber or men's cut.", def: IMG.fade, shape: "arch" },
  { key: "lee", group: "Homepage", label: "Meet Lee", hint: "Lee at the chair. Portrait.", def: IMG.blowdry, shape: "arch" },
  { key: "about", group: "About Lee page", label: "Portrait", hint: "Lee at work, natural light.", def: IMG.curls, shape: "arch" },
  { key: "interior", group: "About Lee page", label: "The space", hint: "The salon room, wide.", def: IMG.interior, shape: "wide" },
  ...CATEGORIES.map((c) => ({ key: `cat-${c.id}`, group: "Service photos", label: c.name, hint: "Shown on the menu banner and behind the colour ring.", def: CATEGORY_PHOTO[c.id], shape: "wide" as const })),
];

export const DEFAULT_REEL: GalleryItem[] = [
  [IMG.blowdry, "Round-brush blow dry"], [IMG.rainbow, "Vivid colour melt"], [IMG.barberCut, "Scissor-over-comb"], [IMG.styling, "Pin-curl set"],
  [IMG.natural, "Natural texture"], [IMG.pinkFlip, "Rose-gold pink"], [IMG.curls, "Iron curls"], [IMG.barberBlow, "Barber blow-out"],
  [IMG.updo, "Braided updo"], [IMG.silverWash, "Silver toning wash"],
].map(([src, title]) => ({ src, title, cat: "", s: "" }));

export const DEFAULT_WORK: GalleryItem[] = [
  { src: IMG.color, title: "Lavender waves", cat: "Color", s: "color" },
  { src: IMG.blonde, title: "Lived-in balayage", cat: "Highlights", s: "highlights" },
  { src: IMG.barber, title: "Fade & curl texture", cat: "For him", s: "him" },
  { src: IMG.curls, title: "Iron curls", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.styling, title: "Pin-curl set", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.rainbow, title: "Vivid colour melt", cat: "Color", s: "color" },
  { src: IMG.fade, title: "Skin fade & beard line-up", cat: "For him", s: "him" },
  { src: IMG.silverWash, title: "Silver toning wash", cat: "Treatments", s: "treatments" },
  { src: IMG.pinkFlip, title: "Rose-gold pink", cat: "Color", s: "color" },
  { src: IMG.natural, title: "Natural texture, shaped", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.updo, title: "Braided updo", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.pompadour, title: "Classic pompadour", cat: "For him", s: "him" },
  { src: IMG.blowdry, title: "Round-brush blow dry", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.barberCut, title: "Scissor-over-comb", cat: "For him", s: "him" },
  { src: IMG.wash, title: "Botanical deep conditioning", cat: "Treatments", s: "treatments" },
];

/** Built-in photos shipped with the site, offered in the library next to Lee's uploads. */
export const BUILT_IN = [...new Set(Object.values(IMG))];

async function json<T>(key: string, fallback: T): Promise<T> {
  const r = await one<{ value: T }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return r ? r.value : fallback;
}

/** slot key → current photo URL */
export async function getPhotos(): Promise<Record<string, string>> {
  const over = await json<Record<string, string>>("photos", {});
  return Object.fromEntries(SLOTS.map((s) => [s.key, over[s.key] || s.def]));
}
export const getReel = () => json<GalleryItem[]>("reel", DEFAULT_REEL);
export const getWork = () => json<GalleryItem[]>("work", DEFAULT_WORK);
export const categoryPhoto = (photos: Record<string, string>, id: string) => photos[`cat-${id}`] || CATEGORY_PHOTO[id];

export type Media = { id: number; url: string; name: string; width: number; height: number; bytes: number; created_at: string };
export const listMedia = () =>
  q<Media>(`SELECT id, '/api/media/' || id AS url, name, width, height, bytes, created_at FROM media ORDER BY created_at DESC`);
