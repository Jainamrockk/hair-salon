// Feature catalogue for the Salon Ché proposal.
// The base website is included. Every feature after that is an add-on with its own price.
export type Feature = {
  id: string;
  name: string;
  price: number; // one-time build cost, USD
  monthly?: string; // running cost passed through, if any
  summary: string;
  where: string[]; // pages that use it
  group: "Clients" | "Revenue" | "Owner" | "Smart";
};

export const BASE_PACKAGE = {
  name: "Premium base website",
  price: 1200,
  includes: [
    "Home, Services & prices, Meet Lee, Work gallery, Reviews, Visit, Policies",
    "Premium editorial design, phone + desktop, accessibility (WCAG 2.2 AA)",
    "Google Maps, call / text buttons, SEO and social sharing",
    "Hosting on Vercel + Neon Postgres (free tiers)",
  ],
};

export const FEATURES: Feature[] = [
  { id: "booking", name: "Online booking engine", price: 450, group: "Clients", summary: "Live openings from Lee's real hours, multi-service visits, buffers and booking rules.", where: ["/book"] },
  { id: "sms", name: "Text confirmations & reminders", price: 150, monthly: "Twilio ≈ $0.01 / text", group: "Clients", summary: "Confirmation, 2-day and 2-hour reminders, reply-to-reschedule.", where: ["/book", "/account"] },
  { id: "deposits", name: "Deposits & card payments", price: 300, monthly: "Stripe 2.9% + 30¢", group: "Revenue", summary: "$20 deposit on color and long visits, Apple / Google Pay, no-show protection.", where: ["/book"] },
  { id: "after-hours", name: "After-hours requests", price: 120, group: "Clients", summary: "Clients ask for evenings or early mornings; Lee approves or offers other times.", where: ["/book/request", "/owner/requests"] },
  { id: "waitlist", name: "Smart waitlist", price: 180, group: "Clients", summary: "Clients pick days and times; first match gets a text when a slot opens.", where: ["/book/waitlist", "/owner/requests"] },
  { id: "accounts", name: "Client accounts", price: 350, group: "Clients", summary: "Password-free sign-in by text code, upcoming visits, reschedule, cancel, rebook, history.", where: ["/account"] },
  { id: "consultation", name: "Consultation & patch-test forms", price: 120, group: "Clients", summary: "Hair history, allergies, inspiration photos and patch-test reminders for first color.", where: ["/book"] },
  { id: "messaging", name: "Client messaging inbox", price: 200, group: "Clients", summary: "Two-way messages between clients and the salon, in the account and the owner app.", where: ["/account/messages", "/owner/messages"] },
  { id: "gift-cards", name: "Digital gift cards", price: 250, group: "Revenue", summary: "Any amount, sent by email with a note, balance tracked and redeemable at the chair.", where: ["/gift-cards"] },
  { id: "shop", name: "Retail shop — reserve & pickup", price: 350, group: "Revenue", summary: "Hair Evolution, Rusk and Ekklesia products, reserve online and pay at pickup.", where: ["/shop", "/owner/orders"] },
  { id: "loyalty", name: "Loyalty punch card", price: 180, group: "Revenue", summary: "Every 6th visit earns a complimentary deep-conditioning treatment.", where: ["/account"] },
  { id: "reviews", name: "Live Google reviews + replies", price: 150, group: "Revenue", summary: "Pull reviews from Google Business Profile, reply and thank clients from the owner app.", where: ["/reviews", "/owner/reviews"] },
  { id: "assistant", name: "AI salon assistant", price: 400, monthly: "Claude API usage", group: "Smart", summary: "Answers prices, hours and parking, recommends services and hands off to Lee.", where: ["All pages"] },
  { id: "try-on", name: "Virtual hair-color try-on", price: 380, group: "Smart", summary: "Upload a photo, preview a shade at any strength, save looks and book that color.", where: ["/try-on"] },
  { id: "owner-app", name: "Owner app — day, calendar & clients", price: 600, group: "Owner", summary: "Today view, calendar, new appointments, block time, client profiles and notes.", where: ["/owner"] },
  { id: "earnings", name: "Earnings & payout reports", price: 200, group: "Owner", summary: "Booked today, this week vs last, day-by-day table and payouts.", where: ["/owner/money"] },
  { id: "setup", name: "Self-serve setup (hours, prices, rules)", price: 220, group: "Owner", summary: "Lee edits hours, the price list, deposit and cancellation rules without a developer.", where: ["/owner/hours", "/owner/menu", "/owner/rules"] },
  { id: "edit-by-text", name: "Edit the website by text", price: 300, group: "Smart", summary: "“Change Thursday hours to 10–1” — drafted, previewed and published in one tap, with undo.", where: ["/owner/website"] },
];

export const featureById = (id: string) => FEATURES.find((f) => f.id === id);
export const showPriceTags = () => (process.env.NEXT_PUBLIC_SHOW_PRICE_TAGS ?? "true") !== "false";
