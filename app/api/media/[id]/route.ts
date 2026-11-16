import { one } from "@/lib/db";

export const runtime = "nodejs";

/** Serves photos Lee uploaded from the owner app. They never change once stored, so browsers and the CDN cache them for a year. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const m = await one<{ mime: string; data_b64: string }>(`SELECT mime, data_b64 FROM media WHERE id = $1`, [id]);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m.data_b64, "base64"), {
    headers: { "Content-Type": m.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
