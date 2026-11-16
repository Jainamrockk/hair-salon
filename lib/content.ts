// Salon facts, taken from salonche.com and confirmed in the Salon Ché design file.
export const SALON = {
  name: "Salon Ché",
  tagline: "Let it shine.",
  owner: "Lee Ortivez",
  ownerTitle: "Designer, stylist & owner",
  years: 34,
  phone: "208-466-5500",
  phoneHref: "tel:+12084665500",
  smsHref: "sms:+12084665500",
  email: "info@salonche.com",
  street: "507 Almond Street",
  city: "Nampa, ID 83686",
  area: "South Nampa, Idaho",
  mapsQuery: "507 Almond Street, Nampa, ID 83686",
  timezone: "America/Boise",
  movedYear: 2017,
  brands: ["Hair Evolution", "Rusk", "Ekklesia"],
  quote: "My passion and enjoyment is working with and serving people.",
  credentials: [
    "Licensed cosmetology instructor in Idaho",
    "Former TIGI platform artist & ambassador, teaching at local schools and salons",
    "Advanced Rusk Designer-level training",
    "34 years behind the chair — color, cutting and correction",
  ],
};

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON.mapsQuery)}`;
export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(SALON.mapsQuery)}&z=15&output=embed`;

// Category "shade chart" — every service category is tied to a real hair-colour shade code,
// exactly like the swatch rings on a salon colour bar.
export const CATEGORIES = [
  { id: "cuts", name: "Cuts & Styling", shade: "1N", shadeName: "Soft Black", hex: "#1d1a17", ink: "#fff" },
  { id: "color", name: "Color", shade: "6RR", shadeName: "Cherry", hex: "#8c1c2b", ink: "#fff", note: "Complimentary haircut with all full-service color." },
  { id: "highlights", name: "Highlights", shade: "8G", shadeName: "Honey", hex: "#c99a52", ink: "#15110F" },
  { id: "perms", name: "Perms", shade: "7C", shadeName: "Copper", hex: "#a2532a", ink: "#fff", note: "Haircut included." },
  { id: "smoothing", name: "Smoothing", shade: "5N", shadeName: "Chestnut", hex: "#5e3c2a", ink: "#fff" },
  { id: "treatments", name: "Treatments", shade: "9A", shadeName: "Ash", hex: "#b7ad9d", ink: "#15110F" },
  { id: "waxing", name: "Waxing", shade: "10P", shadeName: "Platinum", hex: "#e6dfd2", ink: "#15110F" },
  { id: "him", name: "For Him", shade: "3N", shadeName: "Espresso", hex: "#33241c", ink: "#fff" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const DAY_LABEL: Record<string, string> = {
  sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday",
};

// Salon photography, bundled in /public/photos (Unsplash licence) so it always loads. Swap for Lee's own shots when ready.
const ph = (n: string) => `/photos/${n}.jpg`;
export const IMG = {
  hero: ph("balayage"),
  chair: ph("salon-chair"),
  color: ph("lavender"),
  styling: ph("pin-curls"),
  barber: ph("barber-fade"),
  products: ph("brush-products"),
  interior: ph("salon-dark"),
  wash: ph("shampoo"),
  portrait: ph("stylist-smile"),
  curls: ph("curling"),
  blonde: ph("balayage"),
  tools: ph("brushes"),
  blowdry: ph("blowdry"),
  rainbow: ph("rainbow"),
  pinkFlip: ph("pink-flip"),
  natural: ph("natural-curls"),
  curlySmile: ph("curly-smile"),
  fade: ph("fade"),
  barberCut: ph("barber-cut"),
  barberBlow: ph("barber-blowdry"),
  barbershop: ph("barbershop"),
  pompadour: ph("pompadour"),
  beard: ph("beard-shave"),
  updo: ph("updo"),
  silverWash: ph("silver-wash"),
  dryer: ph("dryer"),
  stylistTools: ph("stylist-tools"),
  barberTools: ph("barber-tools"),
  salonWhite: ph("salon-white"),
};

/** One photograph per service family, used on the menu and in booking. */
export const CATEGORY_PHOTO: Record<string, string> = {
  cuts: IMG.blowdry, color: IMG.color, highlights: IMG.blonde, perms: IMG.curls,
  smoothing: IMG.portrait, treatments: IMG.silverWash, waxing: IMG.tools, him: IMG.barber,
};
