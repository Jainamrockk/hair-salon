import { NextResponse } from "next/server";
import { clientId } from "@/lib/auth";
import { one, q } from "@/lib/db";

export async function GET() {
  const cid = await clientId();
  if (!cid) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const client = await one(`SELECT first_name, last_name, phone, email, notes, allergies, marketing, created_at FROM clients WHERE id = $1`, [cid]);
  const appointments = await q(`SELECT starts_at, service_names, total_cents, status FROM appointments WHERE client_id = $1 ORDER BY starts_at`, [cid]);
  const messages = await q(`SELECT sender, body, created_at FROM messages WHERE client_id = $1 ORDER BY created_at`, [cid]);
  const looks = await q(`SELECT shade, strength, area, created_at FROM saved_looks WHERE client_id = $1`, [cid]);
  return new NextResponse(JSON.stringify({ client, appointments, messages, looks }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=salon-che-my-data.json" },
  });
}
