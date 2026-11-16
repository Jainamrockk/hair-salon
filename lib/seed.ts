import { SALON } from "./content";

export const DEFAULT_HOURS: Record<string, { open: string; close: string } | null> = {
  sun: null,
  mon: { open: "11:00", close: "18:00" },
  tue: { open: "10:00", close: "19:00" },
  wed: { open: "10:00", close: "19:00" },
  thu: { open: "10:00", close: "13:00" },
  fri: { open: "10:00", close: "19:00" },
  sat: { open: "10:00", close: "13:00" },
};

export const DEFAULT_RULES = {
  depositCents: 2000,
  depositMinMinutes: 90,
  depositCategories: ["color", "highlights", "smoothing", "perms"],
  cancelHours: 24,
  bufferMin: 10,
  minNoticeHours: 2,
  maxDaysAhead: 60,
  bookingPaused: false,
  slotStepMin: 15,
};

export const DEFAULT_SITE = {
  announcement: "Special — Clear gloss, any length, $50.",
  heroTitle: "Let it shine.",
  heroLead: `Cuts, creative color, perms and waxing for her and for him, by ${SALON.owner}. ${SALON.years} years behind the chair. Book in under a minute — even after hours.`,
  aboutLead: `Owner and stylist at Salon Ché. Thirty-four years of color and cutting, a teacher's eye for why a shape works, and a chair that feels like catching up with an old friend.`,
  holidayNote: "",
};

// [category, name, minutes, priceCents, label?, note?]
type S = [string, string, number, number, string?, string?];
export const SERVICES: S[] = [
  ["cuts", "Women's haircut & blow dry", 45, 3000],
  ["cuts", "Women's haircut & blow dry, long hair", 60, 3600],
  ["cuts", "Women's haircut & full style", 60, 4200],
  ["cuts", "Fringe trim", 10, 800],
  ["cuts", "Child cut, 10 and under", 20, 1400],
  ["cuts", "Child cut, 10 to 12", 30, 2500],
  ["cuts", "Shampoo set & style", 45, 3200],
  ["cuts", "Roller set", 60, 3200],
  ["cuts", "Updo", 60, 5500, "and up"],
  ["color", "Color", 90, 7500, undefined, "Complimentary haircut included"],
  ["color", "Extra length & color", 15, 2000, "and up", "Added to any color"],
  ["color", "Allover lightener", 120, 7500, "and up"],
  ["color", "Root retouch & quick blow dry", 75, 5500],
  ["color", "Corrective color", 60, 16500, "an hour", "By consultation"],
  ["color", "Clear gloss, any length", 30, 5000, undefined, "This month's special"],
  ["color", "Toner", 30, 4000],
  ["color", "Pre-treatment bleach", 30, 3500, "and up"],
  ["highlights", "Highlights, two colors", 150, 8500, "and up"],
  ["highlights", "Partial highlights, two colors", 105, 5500, "and up"],
  ["highlights", "Single foil, one color", 10, 1000],
  ["perms", "Perm, short hair", 120, 7500, undefined, "Haircut included"],
  ["perms", "Perm, medium hair", 135, 8500, undefined, "Haircut included"],
  ["perms", "Perm, long hair", 150, 9500, "and up", "Haircut included"],
  ["smoothing", "Chemical or keratin straightening", 180, 17500, "and up", "Short, medium or long hair"],
  ["treatments", "Deep conditioning with botanical oil", 20, 2800],
  ["treatments", "Gloss deep conditioning", 20, 2800],
  ["waxing", "Brow wax", 10, 1400],
  ["waxing", "Brow tweeze", 15, 2000],
  ["waxing", "Lip wax", 10, 1200],
  ["waxing", "Chin wax", 10, 1400],
  ["waxing", "Face wax", 20, 3000],
  ["him", "Men's haircut & style", 30, 2300],
  ["him", "Beard trim", 15, 1300, "– $16"],
  ["him", "Men's color", 45, 6000, "and up"],
  ["him", "Men's highlights", 60, 6500, "and up"],
  ["him", "Men's brow wax", 10, 1200],
  ["him", "Nose wax", 10, 1000],
  ["him", "Back wax", 30, 4000, "and up"],
  ["him", "Chest & stomach wax", 30, 4000, "and up"],
];

const p = (n: string) => `/photos/${n}.jpg`;
export const PRODUCTS = [
  { slug: "restorative-mask", sku: "SH-01", brand: "Hair Evolution", name: "Restorative Mask", category: "Treatments", size: "8 oz", price: 3800, img: p("brush-products"), description: "A rich weekly mask that rebuilds dry, color-treated lengths with botanical proteins.", how: "After shampoo, comb through mid-lengths to ends. Leave 5 minutes, rinse cool." },
  { slug: "smoothing-shampoo", sku: "SH-02", brand: "Rusk", name: "Smoothing Shampoo", category: "Care", size: "12 oz", price: 2200, img: p("shampoo"), description: "Gentle, sulfate-free cleanse that tames frizz and keeps color bright.", how: "Lather into wet hair, massage the scalp, rinse. Follow with conditioner." },
  { slug: "smoothing-conditioner", sku: "SH-03", brand: "Rusk", name: "Smoothing Conditioner", category: "Care", size: "12 oz", price: 2400, img: p("silver-wash"), description: "Weightless slip and shine for every hair type.", how: "Apply to lengths, leave 1–2 minutes, rinse." },
  { slug: "botanical-hair-oil", sku: "SH-04", brand: "Ekklesia", name: "Botanical Hair Oil", category: "Treatments", size: "2 oz", price: 3200, img: p("brush-products"), description: "Lee's favourite finishing oil — cold-pressed botanicals for gloss without grease.", how: "Two drops between palms, smooth over dry or damp ends." },
  { slug: "scalp-oil", sku: "SH-05", brand: "Ekklesia", name: "Scalp Oil", category: "Treatments", size: "1 oz", price: 3000, img: p("stylist-tools"), description: "Soothing pre-wash scalp treatment for dryness and tension.", how: "Part hair, apply with dropper, massage 3 minutes, leave 20 minutes before washing." },
  { slug: "thermal-protect", sku: "SH-06", brand: "Rusk", name: "Thermal Protect Spray", category: "Styling", size: "8 oz", price: 2000, img: p("dryer"), description: "Heat protection up to 450°F with a soft, touchable hold.", how: "Mist over damp hair before blow drying or hot tools." },
  { slug: "volumizing-mousse", sku: "SH-07", brand: "Rusk", name: "Volumizing Mousse", category: "Styling", size: "8 oz", price: 1900, img: p("curling"), description: "Root lift and body that lasts all day, never crunchy.", how: "Shake, dispense a golf-ball amount, work through roots and blow dry." },
  { slug: "leave-in", sku: "SH-08", brand: "Hair Evolution", name: "Leave-In Conditioner", category: "Care", size: "6 oz", price: 2600, img: p("brushes"), description: "Detangles, protects and adds moisture between washes.", how: "Spray on towel-dried hair and comb through. Do not rinse." },
];

export const CLIENTS = [
  ["Maria", "Gomez", "2085550142", "maria@example.com", "Growing out old highlights, wants a little darker for winter.", ""],
  ["Dana", "Reyes", "2085550188", "dana@example.com", "Fine hair, likes dry-cut finishing.", ""],
  ["Tom", "Koch", "2085550111", null, "Short sides, scissor top. Beard to the jawline.", ""],
  ["Priya", "Shah", "2085550175", "priya@example.com", "Root retouch every 5 weeks. 6N.", "Sensitive scalp — patch test on file"],
  ["Jenna", "Albright", "2085550133", "jenna@example.com", "Copper all-over, gloss each visit.", ""],
  ["Rosa", "Medina", "2085550199", null, "Roller set every Friday.", ""],
] as const;

export const REVIEWS = [
  ["Jenna A.", 5, "Lee is a true artist. My copper has never looked so rich — and it lasted. The salon is calm and spotless.", "Color"],
  ["Tom K.", 5, "Best men's cut in Nampa. In and out in thirty minutes and it grows out perfectly.", "Men's cut"],
  ["Maria G.", 5, "Thirty-four years shows. Lee fixed a box-dye disaster and explained every step.", "Corrective color"],
  ["Rosa M.", 5, "I've had my standing Friday set with Lee for years. Kind, punctual, and so skilled.", "Roller set"],
  ["Priya S.", 5, "Booking online after 9pm and getting a text right away — so easy. Hair is gorgeous.", "Root retouch"],
  ["Hannah L.", 4, "Lovely balayage, really natural. Parking out front made it easy with the kids.", "Highlights"],
] as const;
