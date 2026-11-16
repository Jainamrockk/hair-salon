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

// Curated imagery (Unsplash, free licence). Swap for Lee's own shot list (P-01 … P-12) when ready.
const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
export const IMG = {
  hero: u("photo-1560066984-138dadb4c035", 2000),
  chair: u("photo-1521590832167-7bcbfaa6381f"),
  color: u("photo-1562322140-8baeececf3df"),
  styling: u("photo-1522337360788-8b13dee7a37e"),
  barber: u("photo-1503951914875-452162b0f3f1"),
  products: u("photo-1580618672591-eb180b1a973f"),
  interior: u("photo-1600948836101-f9ffda59d250"),
  wash: u("photo-1527799820374-dcf8d9d4a388"),
  portrait: u("photo-1595476108010-b4d1f102b1b1"),
  curls: u("photo-1519699047748-de8e457a634e"),
  blonde: u("photo-1605497788044-5a32c7078486"),
  tools: u("photo-1599351431202-1e0f0137899a"),
};
