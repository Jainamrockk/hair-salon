import { NextResponse } from "next/server";
import { AI_COLOURS, AI_STYLES } from "@/lib/ai-styles";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Photo-real AI try-on: sends the visitor's photo to Google's Gemini image model with an instruction to change
 * only the haircut (and optionally the colour), and returns the edited image. Needs GEMINI_API_KEY.
 * The photo is not stored by the salon; it is sent to Google only to make this one image.
 */
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const MAX_B64 = 6_000_000; // ~4.5 MB image

// a small per-IP limiter so one visitor can't run up the API bill
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), win = 10 * 60_000, max = Number(process.env.TRYON_LIMIT_PER_10MIN || 12);
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  if (list.length >= max) return true;
  list.push(now); hits.set(ip, list);
  return false;
}

export async function GET() {
  return NextResponse.json({ enabled: !!process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "The photo-real try-on isn't switched on yet. The salon needs to add its Google Gemini key." }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "You've tried a lot of looks — take a breather and try again in a few minutes." }, { status: 429 });

  let body: { image?: string; mime?: string; style?: string; colour?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const style = AI_STYLES.find((s) => s.id === body.style);
  const colour = AI_COLOURS.find((c) => c.id === body.colour) ?? AI_COLOURS[0];
  const mime = body.mime === "image/png" ? "image/png" : "image/jpeg";
  if (!style || !body.image || typeof body.image !== "string") return NextResponse.json({ error: "Pick a photo and a haircut." }, { status: 400 });
  if (body.image.length > MAX_B64) return NextResponse.json({ error: "That photo is too large. Try a smaller one." }, { status: 413 });

  const prompt = [
    `Edit this photo so the person has ${style.prompt}${colour.text ? `, with the hair coloured ${colour.text}` : ""}.`,
    "Keep everything else exactly the same: the same person and identity, face shape, features, expression, skin tone and texture, makeup, facial hair (unless the style says otherwise), clothing, pose, camera angle, framing, lighting and background.",
    "Change only the hair. Make it photorealistic, like a real professional salon result photographed in the same light, with natural hairline, believable strands and correct shadows. Do not add text or watermarks.",
  ].join(" ");

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ inline_data: { mime_type: mime, data: body.image } }, { text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("tryon: gemini error", res.status, JSON.stringify(data).slice(0, 400));
      return NextResponse.json({ error: res.status === 429 ? "The try-on is busy right now — please try again in a minute." : "The try-on couldn't make that look. Try a clearer, front-facing photo." }, { status: 502 });
    }
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p: any) => p.inlineData?.data || p.inline_data?.data);
    if (!img) {
      const why = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || "no image";
      console.error("tryon: no image returned", why);
      return NextResponse.json({ error: "We couldn't make that look from this photo. Try a well-lit, front-facing photo of one person." }, { status: 422 });
    }
    const out = img.inlineData ?? img.inline_data;
    return NextResponse.json({ image: out.data, mime: out.mimeType ?? out.mime_type ?? "image/png", style: style.id });
  } catch (e) {
    console.error("tryon: request failed", e);
    return NextResponse.json({ error: "The try-on service didn't answer. Please try again." }, { status: 504 });
  }
}
