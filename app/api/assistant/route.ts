import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { DAY_LABEL, SALON, categoryById } from "@/lib/content";
import { getHours, getRules, getServices, nextOpenings } from "@/lib/data";
import { fmtDateStr, fmtMin, hhmmToMin, money } from "@/lib/time";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };
type Reply = { text: string; links?: { href: string; label: string }[]; handoff?: boolean };

async function context() {
  const [services, hours, rules, open] = await Promise.all([getServices(), getHours(), getRules(), nextOpenings(4)]);
  const hoursText = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => {
    const h = (hours as any)[d]; return `${DAY_LABEL[d]}: ${h ? `${fmtMin(hhmmToMin(h.open))}–${fmtMin(hhmmToMin(h.close))}` : "Closed"}`;
  }).join("; ");
  const menu = services.map((s) => `- [${s.id}] ${categoryById(s.category).name}: ${s.name}, ${s.duration_min} min, ${money(s.price_cents)}${s.price_label ? " " + s.price_label : ""}${s.note ? ` (${s.note})` : ""}`).join("\n");
  const openText = open.map((o) => `${fmtDateStr(o.date, { weekday: "short", month: "short", day: "numeric" })} ${fmtMin(o.min)}`).join(", ");
  return { services, hoursText, menu, openText, rules };
}

function ruleBased(q: string, c: Awaited<ReturnType<typeof context>>): Reply {
  const t = q.toLowerCase();
  const find = (re: RegExp) => c.services.filter((s) => re.test(s.name.toLowerCase()) || re.test(s.category));
  if (/(park|parking)/.test(t)) return { text: `Free parking right out front of ${SALON.street}, and the entrance is at street level.`, links: [{ href: "/visit", label: "Directions" }] };
  if (/(hour|open|close|when are you)/.test(t) && !/free|available|slot/.test(t)) return { text: `Our hours: ${c.hoursText}. Evenings and early mornings are available by request.`, links: [{ href: "/book/request", label: "Request after-hours" }] };
  if (/(free|available|opening|slot|this week|today|tomorrow)/.test(t)) return { text: `Lee's next openings: ${c.openText}. Want me to start a booking?`, links: [{ href: "/book", label: "See all times" }] };
  if (/(root|grey|gray|showing)/.test(t)) { const s = find(/root retouch/)[0]; return { text: `Sounds like a root retouch — ${s ? `${money(s.price_cents)}, about ${s.duration_min} minutes, with a quick blow dry` : "about 75 minutes"}. A $${c.rules.depositCents / 100} deposit holds the spot.`, links: s ? [{ href: `/book?s=${s.id}`, label: "Book root retouch" }] : [] }; }
  if (/(highlight|balayage|blonde|foil)/.test(t)) { const s = find(/highlight/); return { text: `Highlights: ${s.map((x) => `${x.name} ${money(x.price_cents)}${x.price_label ? " " + x.price_label : ""}`).join("; ")}.`, links: s[0] ? [{ href: `/book?s=${s[0].id}`, label: "Book highlights" }] : [] }; }
  if (/(color|colour|dye|red|brunette|copper)/.test(t)) { const s = find(/^color$|toner|gloss|retouch/); return { text: `Full-service color is ${money(7500)} and includes a complimentary haircut. Also: ${s.filter((x) => x.name !== "Color").map((x) => `${x.name} ${money(x.price_cents)}`).join(", ")}. First color with Lee may need a quick patch test.`, links: [{ href: `/book?s=${c.services.find((x) => x.name === "Color")?.id ?? ""}`, label: "Book color" }, { href: "/try-on", label: "Try a shade" }] }; }
  if (/(men|beard|barber|guy|husband)/.test(t)) { const s = find(/^him$/); return { text: `For him: ${c.services.filter((x) => x.category === "him").slice(0, 4).map((x) => `${x.name} ${money(x.price_cents)}`).join(", ")}.`, links: [{ href: "/services#him", label: "Men's menu" }] }; void s; }
  if (/(cut|trim|bang|fringe)/.test(t)) return { text: `Cuts start at ${money(3000)} for a women's cut and blow dry (${money(3600)} for long hair), fringe trims are ${money(800)}, men's cuts ${money(2300)}.`, links: [{ href: "/services#cuts", label: "All cuts" }] };
  if (/(wax|brow|lip)/.test(t)) return { text: `Waxing: brow ${money(1400)}, lip ${money(1200)}, chin ${money(1400)}, face ${money(3000)}.`, links: [{ href: "/services#waxing", label: "Waxing menu" }] };
  if (/(perm|curl|wave)/.test(t)) return { text: `Perms include a haircut: short ${money(7500)}, medium ${money(8500)}, long ${money(9500)} and up.`, links: [{ href: "/services#perms", label: "Perms" }] };
  if (/(keratin|straight|smooth|frizz)/.test(t)) return { text: `Keratin or chemical smoothing is ${money(17500)} and up, about 3 hours.`, links: [{ href: "/services#smoothing", label: "Smoothing" }] };
  if (/(gift)/.test(t)) return { text: "Digital gift cards in any amount, sent by email in two taps, and they never expire.", links: [{ href: "/gift-cards", label: "Send a gift card" }] };
  if (/(cancel|reschedule|move|late)/.test(t)) return { text: `Change or cancel free until ${c.rules.cancelHours} hours before from your account or the link in your text. Running late? Text ${SALON.phone}.`, links: [{ href: "/account", label: "My visits" }] };
  if (/(price|cost|how much|menu)/.test(t)) return { text: "Every price is on our menu — cuts from $30, color $75 with a free cut, highlights from $55.", links: [{ href: "/services", label: "Full menu" }] };
  if (/(product|shampoo|oil|rusk|ekklesia|evolution)/.test(t)) return { text: `Lee carries ${SALON.brands.join(", ")}. Reserve online, pick up at your visit.`, links: [{ href: "/shop", label: "Shop" }] };
  return { text: `Good question — that's one for Lee. Text ${SALON.phone} and Lee will reply personally.`, handoff: true, links: [{ href: SALON.smsHref, label: "Text Lee" }] };
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Msg[] };
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const c = await context();
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json(ruleBased(last, c));

  try {
    const client = new Anthropic();
    const system = `You are the friendly AI assistant for ${SALON.name}, a one-stylist hair salon at ${SALON.street}, ${SALON.city}, owned by ${SALON.owner} (${SALON.years} years experience, licensed cosmetology instructor, former TIGI ambassador). Phone/text ${SALON.phone}.
Answer in 1–3 short, warm sentences. Only use facts below. Never invent prices or times. For anything medical, complaints, refunds, or unsure: suggest texting Lee.
When recommending a bookable service, end your reply with a line: BOOK:<service id>. When handing off to Lee, end with: HANDOFF.
Hours: ${c.hoursText}. Free parking out front, street-level entrance.
Deposit: $${c.rules.depositCents / 100} for color or visits ≥ ${c.rules.depositMinMinutes} min. Free cancel until ${c.rules.cancelHours}h before.
Next openings: ${c.openText}.
Menu:\n${c.menu}`;
    const res = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system,
      output_config: { effort: "low" },
      messages: messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (res.stop_reason === "refusal") return NextResponse.json(ruleBased(last, c));
    let text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    const links: Reply["links"] = [];
    const book = text.match(/BOOK:(\d+)/);
    if (book) { const s = c.services.find((x) => x.id === +book[1]); if (s) links.push({ href: `/book?s=${s.id}`, label: `Book ${s.name}` }); }
    const handoff = /HANDOFF/.test(text);
    if (handoff) links.push({ href: SALON.smsHref, label: "Text Lee" });
    text = text.replace(/BOOK:\d+|HANDOFF/g, "").trim();
    return NextResponse.json({ text, links, handoff } satisfies Reply);
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("assistant api error", e.status, e.message);
    else console.error("assistant error", e);
    return NextResponse.json(ruleBased(last, c));
  }
}
