import "server-only";
import { getHours, getServices, getSite } from "./data";
import { DAY_LABEL } from "./content";
import { fmtMin, hhmmToMin, money } from "./time";

export type SiteDraft =
  | { ok: true; key: "hours" | "site" | "service"; summary: string; patch: Record<string, unknown>; before: string; after: string }
  | { ok: false; message: string };

const DAY_RE: Record<string, string> = { sun: "sun", mon: "mon", tue: "tue", tues: "tue", wed: "wed", thu: "thu", thur: "thu", thurs: "thu", fri: "fri", sat: "sat" };
function findDay(t: string) {
  const m = t.match(/\b(sun|mon|tues?|wed|thu(?:rs?)?|fri|sat)[a-z]*\b/i);
  return m ? DAY_RE[m[1].toLowerCase()] : undefined;
}
function toTime(s: string, isClose = false): string | undefined {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (!m) return;
  let h = +m[1]; const min = +(m[2] || 0); const ap = m[3]?.toLowerCase();
  if (ap?.startsWith("p") && h < 12) h += 12;
  if (ap?.startsWith("a") && h === 12) h = 0;
  if (!ap && h < 8) h += 12; // "10-1" → 10 AM to 1 PM
  if (!ap && isClose && h < 9) h += 12;
  if (h > 23) return;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
const fmtH = (h: { open: string; close: string } | null) => (h ? `${fmtMin(hhmmToMin(h.open))} – ${fmtMin(hhmmToMin(h.close))}` : "Closed");

export async function draftSiteChange(text: string): Promise<SiteDraft> {
  const t = text.trim();
  if (!t) return { ok: false, message: "Tell me what to change." };
  const low = t.toLowerCase();

  // Hours
  if (/\b(hours?|open|close[ds]?)\b/.test(low) && findDay(low)) {
    const day = findDay(low)!;
    const hours = await getHours();
    const cur = (hours as any)[day];
    let next: { open: string; close: string } | null | undefined;
    if (/\bclosed?\b(?!\s*at)/.test(low) && !/\d/.test(low)) next = null;
    else {
      const m = low.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a|p)?)\s*(?:-|–|to|until|till)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a|p)?)/);
      if (m) { const o = toTime(m[1]), c = toTime(m[2], true); if (o && c && hhmmToMin(c) > hhmmToMin(o)) next = { open: o, close: c }; }
    }
    if (next === undefined) return { ok: false, message: "I couldn't read the new times. Try “Thursday hours 10 to 1” or “Close on Saturday”." };
    return { ok: true, key: "hours", patch: { [day]: next }, summary: `Changed ${DAY_LABEL[day]} hours to ${fmtH(next)}`, before: `${DAY_LABEL[day]}: ${fmtH(cur)}`, after: `${DAY_LABEL[day]}: ${fmtH(next)}` };
  }

  // Price change
  const price = low.match(/\$\s?(\d+(?:\.\d{1,2})?)/);
  if (price && /(price|cost|now|to \$|make)/.test(low) && !/\badd\b/.test(low)) {
    const services = await getServices(true);
    const words = low.replace(/\$\s?\d+(\.\d+)?/, "").split(/[^a-z']+/).filter((w) => w.length > 2 && !["change", "price", "the", "cost", "make", "now", "set", "for"].includes(w));
    let best = services[0], score = 0;
    for (const s of services) {
      const n = s.name.toLowerCase();
      const sc = words.reduce((a, w) => a + (n.includes(w) ? w.length : 0), 0);
      if (sc > score) { score = sc; best = s; }
    }
    if (!score) return { ok: false, message: "Which service? Try “Change the price of Toner to $45”." };
    const cents = Math.round(parseFloat(price[1]) * 100);
    return { ok: true, key: "service", patch: { id: best.id, price_cents: cents }, summary: `Changed ${best.name} price to ${money(cents)}`, before: `${best.name}: ${money(best.price_cents)}`, after: `${best.name}: ${money(cents)}` };
  }

  // New service
  const add = t.match(/add (?:a )?(?:new )?service[:\s]+(.+)/i);
  if (add) {
    const rest = add[1];
    const mins = rest.match(/(\d+)\s*(?:min|minutes)/i), dollars = rest.match(/\$\s?(\d+)/);
    const cat = ["cuts", "color", "highlights", "perms", "smoothing", "treatments", "waxing", "him"].find((c) => rest.toLowerCase().includes(c)) || (/(men|beard|him)/i.test(rest) ? "him" : "treatments");
    const name = rest.split(/,|\bfor\b|\$|\d+\s*min/i)[0].trim().replace(/^["“]|["”]$/g, "");
    if (!name || !dollars) return { ok: false, message: "Tell me the name and price, like “Add new service Scalp facial, 30 min, $40”." };
    const patch = { name: name[0].toUpperCase() + name.slice(1), category: cat, duration_min: mins ? +mins[1] : 30, price_cents: +dollars[1] * 100 };
    return { ok: true, key: "service", patch, summary: `Added ${patch.name}`, before: "Not on the menu", after: `${patch.name} · ${patch.duration_min} min · ${money(patch.price_cents)}` };
  }

  const site = await getSite();
  // Holiday note
  if (/holiday|vacation|closed for|away/.test(low)) {
    const note = t.replace(/^(please )?(add|put|post)( a)? (holiday|vacation) note( saying| that says)?[:\s]*/i, "").trim();
    return { ok: true, key: "site", patch: { holidayNote: note }, summary: "Added a holiday note", before: site.holidayNote || "No holiday note", after: note };
  }
  // Top bar / special
  const ann = t.match(/(?:top[- ]bar|special|announcement|banner)(?: note)?(?: to| says| saying|:)?\s*[:“"]?(.+?)["”]?$/i);
  if (ann && ann[1].length > 3) {
    const v = ann[1].replace(/^(to|say|says)\s+/i, "");
    return { ok: true, key: "site", patch: { announcement: v }, summary: "Updated the top-bar note", before: site.announcement || "(empty)", after: v };
  }
  // Headline
  const head = t.match(/(?:headline|hero title|big title)(?: to|:)?\s*[“"]?(.+?)["”]?$/i);
  if (head) return { ok: true, key: "site", patch: { heroTitle: head[1] }, summary: "Changed the homepage headline", before: site.heroTitle, after: head[1] };

  return { ok: false, message: "I can change hours, prices, the top-bar special, holiday notes, the headline, or add a service. Try one of the examples." };
}
