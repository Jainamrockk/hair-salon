"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/lib/db";
import { clientId, isOwner, ownerPassword, setClient, setOwner } from "@/lib/auth";
import {
  appointmentById, createAppointment, depositFor, digits, getRangeAvailability, getRules, getSite,
  getSlots, getHours, saveSetting, servicesByIds, upsertClient,
} from "@/lib/data";
import { localDate, localMinutes, localToUtc } from "@/lib/time";
import { sendSms } from "@/lib/notify";
import { draftSiteChange, type SiteDraft } from "@/lib/edit-by-text";

type Res<T = {}> = ({ ok: true } & T) | { ok: false; error: string };

async function requireOwner() { if (!(await isOwner())) throw new Error("Not signed in"); }

// ---------------- Public: availability ----------------
export async function monthAvailability(start: string, days: number, duration: number) {
  return getRangeAvailability(start, Math.min(days, 42), Math.max(10, duration));
}
export async function daySlots(date: string, duration: number, excludeId?: number) {
  return getSlots(date, Math.max(10, duration), excludeId);
}

// ---------------- Booking ----------------
export async function createBooking(input: {
  serviceIds: number[]; date: string; start: number; first: string; last?: string; phone: string; email?: string;
  notes?: string; firstColor?: boolean; allergies?: string; marketing?: boolean; agree?: boolean; payWith?: string; giftCode?: string;
}): Promise<Res<{ id: number }>> {
  const services = await servicesByIds(input.serviceIds);
  if (!services.length) return { ok: false, error: "Pick at least one service." };
  const phone = digits(input.phone);
  if (phone.length !== 10) return { ok: false, error: "Enter a 10-digit mobile number." };
  if (!input.first?.trim()) return { ok: false, error: "Add your first name." };
  const dur = services.reduce((a, s) => a + s.duration_min, 0);
  const slots = await getSlots(input.date, dur);
  if (!slots.includes(input.start)) return { ok: false, error: "That time was just taken. Please pick another." };
  const rules = await getRules();
  const deposit = depositFor(rules, services);
  let paid = 0;
  if (deposit) {
    if (!input.agree) return { ok: false, error: "Please agree to the cancellation policy." };
    if (input.payWith === "gift") {
      const gc = await one<{ id: number; balance_cents: number }>(`SELECT id, balance_cents FROM gift_cards WHERE upper(code) = upper($1)`, [input.giftCode || ""]);
      if (!gc || gc.balance_cents < deposit) return { ok: false, error: "That gift card wasn't found or doesn't cover the deposit." };
      await q(`UPDATE gift_cards SET balance_cents = balance_cents - $2 WHERE id = $1`, [gc.id, deposit]);
    }
    // Stripe add-on: create a PaymentIntent here when STRIPE_SECRET_KEY is set. Demo mode records the deposit.
    paid = deposit;
  }
  const cid = await upsertClient({ first: input.first.trim(), last: input.last?.trim(), phone, email: input.email?.trim(), marketing: input.marketing, allergies: input.allergies });
  const id = await createAppointment({ clientId: cid, date: input.date, start: input.start, services, notes: input.notes, firstColor: input.firstColor, depositCents: deposit, paidCents: paid });
  await setClient(cid);
  await sendSms(phone, `Salon Ché: you're booked with Lee. Reply C to cancel or R to reschedule.`);
  revalidatePath("/owner");
  return { ok: true, id };
}

export async function requestAfterHours(fd: FormData): Promise<Res> {
  const name = String(fd.get("name") || "").trim(), phone = digits(String(fd.get("phone") || ""));
  if (!name || phone.length !== 10) return { ok: false, error: "Add your name and a 10-digit mobile number." };
  await q(`INSERT INTO requests (kind, name, phone, service, preferred, notes) VALUES ('after_hours',$1,$2,$3,$4,$5)`,
    [name, phone, fd.get("service"), fd.get("preferred"), fd.get("notes")]);
  revalidatePath("/owner/requests");
  return { ok: true };
}

export async function joinWaitlist(input: { name: string; phone: string; service: string; days: string[]; times: string[]; weeks: number }): Promise<Res> {
  const phone = digits(input.phone);
  if (!input.name.trim() || phone.length !== 10) return { ok: false, error: "Add your name and a 10-digit mobile number." };
  if (!input.days.length || !input.times.length) return { ok: false, error: "Pick at least one day and time of day." };
  await q(`INSERT INTO requests (kind, name, phone, service, days, times, preferred) VALUES ('waitlist',$1,$2,$3,$4,$5,$6)`,
    [input.name.trim(), phone, input.service, input.days, input.times, `Next ${input.weeks} weeks`]);
  revalidatePath("/owner/requests");
  return { ok: true };
}

// ---------------- Client account ----------------
export async function sendCode(phoneRaw: string): Promise<Res<{ demoCode?: string }>> {
  const phone = digits(phoneRaw);
  if (phone.length !== 10) return { ok: false, error: "Enter a 10-digit mobile number." };
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await q(`INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1,$2, NOW() + INTERVAL '10 minutes') ON CONFLICT (phone) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`, [phone, code]);
  const sent = await sendSms(phone, `Salon Ché code: ${code}`);
  return { ok: true, demoCode: sent ? undefined : code };
}
export async function verifyCode(phoneRaw: string, code: string): Promise<Res> {
  const phone = digits(phoneRaw);
  const r = await one(`SELECT 1 FROM otp_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW()`, [phone, code.trim()]);
  if (!r) return { ok: false, error: "That code didn't match. Try again or resend." };
  await q(`DELETE FROM otp_codes WHERE phone = $1`, [phone]);
  let c = await one<{ id: number }>(`SELECT id FROM clients WHERE phone = $1`, [phone]);
  if (!c) c = { id: await upsertClient({ first: "Guest", phone }) };
  await setClient(c.id);
  return { ok: true };
}
export async function signOutClient() { await setClient(null); redirect("/account"); }

async function ownAppt(id: number) {
  const cid = await clientId();
  const a = await appointmentById(id);
  if (!a || (!(await isOwner()) && a.client_id !== cid)) throw new Error("Not found");
  return a;
}
export async function rescheduleAppointment(id: number, date: string, start: number): Promise<Res> {
  const a = await ownAppt(id);
  const dur = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000;
  const slots = await getSlots(date, dur, id);
  if (!slots.includes(start) && !(await isOwner())) return { ok: false, error: "That time is no longer open." };
  await q(`UPDATE appointments SET starts_at = $2, ends_at = $3, status = 'confirmed' WHERE id = $1`,
    [id, localToUtc(date, start).toISOString(), localToUtc(date, start + dur).toISOString()]);
  if (a.phone) await sendSms(a.phone, `Salon Ché: your visit has moved. See your account for details.`);
  revalidatePath("/account"); revalidatePath("/owner");
  return { ok: true };
}
export async function cancelAppointment(id: number, reason?: string): Promise<Res<{ kept: boolean }>> {
  const a = await ownAppt(id);
  const rules = await getRules();
  const late = new Date(a.starts_at).getTime() - Date.now() < rules.cancelHours * 3600_000;
  await q(`UPDATE appointments SET status = 'cancelled', notes = COALESCE(notes,'') || $2 WHERE id = $1`, [id, reason ? `\nCancelled: ${reason}` : ""]);
  revalidatePath("/account"); revalidatePath("/owner");
  return { ok: true, kept: late && a.deposit_cents > 0 };
}
export async function updateClientSettings(fd: FormData) {
  const cid = await clientId(); if (!cid) return;
  await q(`UPDATE clients SET first_name = $2, last_name = $3, email = $4, marketing = $5 WHERE id = $1`,
    [cid, fd.get("first"), fd.get("last"), fd.get("email") || null, fd.get("marketing") === "on"]);
  revalidatePath("/account/settings");
}
export async function deleteMyData() {
  const cid = await clientId(); if (!cid) return;
  await q(`DELETE FROM saved_looks WHERE client_id = $1`, [cid]);
  await q(`DELETE FROM messages WHERE client_id = $1`, [cid]);
  await q(`UPDATE appointments SET notes = NULL WHERE client_id = $1`, [cid]);
  await q(`UPDATE clients SET email = NULL, notes = NULL, allergies = NULL, marketing = FALSE, last_name = NULL, first_name = 'Deleted' WHERE id = $1`, [cid]);
  await setClient(null);
  redirect("/account");
}

// ---------------- Messages ----------------
export async function clientSendMessage(fd: FormData) {
  const cid = await clientId(); const body = String(fd.get("body") || "").trim();
  if (!cid || !body) return;
  await q(`INSERT INTO messages (client_id, sender, body) VALUES ($1,'client',$2)`, [cid, body]);
  revalidatePath("/account/messages");
}
export async function ownerSendMessage(fd: FormData) {
  await requireOwner();
  const cid = Number(fd.get("clientId")); const body = String(fd.get("body") || "").trim();
  if (!cid || !body) return;
  await q(`INSERT INTO messages (client_id, sender, body, read) VALUES ($1,'salon',$2, TRUE)`, [cid, body]);
  await q(`UPDATE messages SET read = TRUE WHERE client_id = $1 AND sender = 'client'`, [cid]);
  const c = await one<{ phone: string }>(`SELECT phone FROM clients WHERE id = $1`, [cid]);
  if (c) await sendSms(c.phone, `Salon Ché: ${body}`);
  revalidatePath("/owner/messages");
}

// ---------------- Shop & gift cards ----------------
export async function reserveOrder(input: { items: { slug: string; qty: number }[]; name: string; phone: string; email?: string }): Promise<Res<{ id: number }>> {
  const phone = digits(input.phone);
  if (!input.name.trim() || phone.length !== 10) return { ok: false, error: "Add your name and a 10-digit mobile number." };
  if (!input.items.length) return { ok: false, error: "Your bag is empty." };
  const prods = await q<{ slug: string; name: string; brand: string; price_cents: number }>(`SELECT slug, name, brand, price_cents FROM products WHERE slug = ANY($1::text[])`, [input.items.map((i) => i.slug)]);
  const items = input.items.map((i) => { const p = prods.find((x) => x.slug === i.slug)!; return { slug: i.slug, name: `${p.brand} ${p.name}`, qty: Math.max(1, Math.min(9, i.qty)), price: p.price_cents }; });
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);
  const r = await one<{ id: number }>(`INSERT INTO orders (name, phone, email, items, total_cents) VALUES ($1,$2,$3,$4::jsonb,$5) RETURNING id`, [input.name.trim(), phone, input.email || null, JSON.stringify(items), total]);
  for (const i of items) await q(`UPDATE products SET stock = GREATEST(stock - $2, 0) WHERE slug = $1`, [i.slug, i.qty]);
  revalidatePath("/owner/orders");
  return { ok: true, id: r!.id };
}
export async function buyGiftCard(input: { amount: number; buyerName: string; buyerEmail: string; toName?: string; toEmail?: string; note?: string; design: string }): Promise<Res<{ code: string }>> {
  if (!(input.amount >= 10 && input.amount <= 1000)) return { ok: false, error: "Choose an amount between $10 and $1,000." };
  if (!/^\S+@\S+\.\S+$/.test(input.buyerEmail)) return { ok: false, error: "Add your email for the receipt." };
  const code = "CHE-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  await q(`INSERT INTO gift_cards (code, amount_cents, balance_cents, buyer_name, buyer_email, to_name, to_email, note, design) VALUES ($1,$2,$2,$3,$4,$5,$6,$7,$8)`,
    [code, Math.round(input.amount * 100), input.buyerName, input.buyerEmail, input.toName || null, input.toEmail || null, input.note || null, input.design]);
  return { ok: true, code };
}
export async function checkGiftCard(code: string) {
  return one<{ code: string; balance_cents: number; amount_cents: number }>(`SELECT code, balance_cents, amount_cents FROM gift_cards WHERE upper(code) = upper($1)`, [code.trim()]);
}

// ---------------- Try-on ----------------
export async function saveLook(shade: string, strength: number, area: string): Promise<Res> {
  const cid = await clientId();
  if (!cid) return { ok: false, error: "signin" };
  await q(`INSERT INTO saved_looks (client_id, shade, strength, area) VALUES ($1,$2,$3,$4)`, [cid, shade, strength, area]);
  revalidatePath("/account/looks");
  return { ok: true };
}
export async function deleteLook(id: number) {
  const cid = await clientId();
  await q(`DELETE FROM saved_looks WHERE id = $1 AND client_id = $2`, [id, cid]);
  revalidatePath("/account/looks");
}

// ---------------- Owner ----------------
export async function ownerSignIn(_: unknown, fd: FormData) {
  if (String(fd.get("password")) !== ownerPassword()) return { error: "That password isn't right." };
  await setOwner(true);
  redirect("/owner");
}
export async function ownerSignOut() { await setOwner(false); redirect("/owner/sign-in"); }

export async function ownerCreateAppointment(input: { clientId?: number; first?: string; last?: string; phone?: string; serviceIds: number[]; date: string; start: number; notes?: string; force?: boolean }): Promise<Res<{ id: number }>> {
  await requireOwner();
  const services = await servicesByIds(input.serviceIds);
  if (!services.length) return { ok: false, error: "Pick a service." };
  let cid = input.clientId;
  if (!cid) {
    const phone = digits(input.phone || "");
    if (!input.first || phone.length !== 10) return { ok: false, error: "Pick a client or add a name and phone." };
    cid = await upsertClient({ first: input.first, last: input.last, phone });
  }
  const dur = services.reduce((a, s) => a + s.duration_min, 0);
  if (!input.force) {
    const slots = await getSlots(input.date, dur);
    if (!slots.includes(input.start)) return { ok: false, error: "That overlaps another visit or is outside hours. Tick “book anyway” to override." };
  }
  const id = await createAppointment({ clientId: cid, date: input.date, start: input.start, services, notes: input.notes, depositCents: 0, paidCents: 0, source: "owner" });
  revalidatePath("/owner");
  return { ok: true, id };
}
export async function ownerSetStatus(id: number, status: string) {
  await requireOwner();
  await q(`UPDATE appointments SET status = $2 WHERE id = $1`, [id, status]);
  revalidatePath("/owner"); revalidatePath(`/owner/appointments/${id}`);
}
export async function ownerTakePayment(id: number, cents: number, method: string, tipCents: number) {
  await requireOwner();
  await q(`UPDATE appointments SET paid_cents = paid_cents + $2, status = 'completed', notes = COALESCE(notes,'') || $3 WHERE id = $1`,
    [id, cents + tipCents, `\nPaid ${method}${tipCents ? ` incl. tip ${tipCents / 100}` : ""}`]);
  revalidatePath("/owner"); revalidatePath("/owner/money");
}
export async function ownerBlockTime(fd: FormData): Promise<void> {
  await requireOwner();
  const date = String(fd.get("date")), from = String(fd.get("from")), to = String(fd.get("to"));
  const [fh, fm] = from.split(":").map(Number), [th, tm] = to.split(":").map(Number);
  await q(`INSERT INTO blocks (starts_at, ends_at, reason) VALUES ($1,$2,$3)`, [localToUtc(date, fh * 60 + fm).toISOString(), localToUtc(date, th * 60 + tm).toISOString(), fd.get("reason") || "Blocked"]);
  revalidatePath("/owner/calendar");
  redirect(`/owner/calendar?date=${date}`);
}
export async function ownerDeleteBlock(id: number) { await requireOwner(); await q(`DELETE FROM blocks WHERE id = $1`, [id]); revalidatePath("/owner/calendar"); }
export async function ownerSaveHours(hours: Record<string, { open: string; close: string } | null>) {
  await requireOwner();
  const before = await getHours();
  await saveSetting("hours", hours);
  await q(`INSERT INTO site_changes (summary, key, before, after) VALUES ('Updated opening hours','hours',$1::jsonb,$2::jsonb)`, [JSON.stringify(before), JSON.stringify(hours)]);
  revalidatePath("/", "layout");
}
export async function ownerSaveRules(rules: Record<string, unknown>) {
  await requireOwner();
  const cur = await getRules();
  await saveSetting("rules", { ...cur, ...rules });
  revalidatePath("/", "layout");
}
export async function ownerSaveService(fd: FormData) {
  await requireOwner();
  const id = Number(fd.get("id") || 0);
  const vals = [fd.get("category"), fd.get("name"), Number(fd.get("duration")), Math.round(Number(fd.get("price")) * 100), fd.get("label") || null, fd.get("note") || null, fd.get("active") === "on"];
  if (id) await q(`UPDATE services SET category=$2, name=$3, duration_min=$4, price_cents=$5, price_label=$6, note=$7, active=$8 WHERE id=$1`, [id, ...vals]);
  else await q(`INSERT INTO services (category, name, duration_min, price_cents, price_label, note, active, sort) VALUES ($1,$2,$3,$4,$5,$6,$7, 999)`, vals);
  revalidatePath("/", "layout");
}
export async function ownerRequestStatus(id: number, status: string) {
  await requireOwner();
  const r = await one<{ phone: string; name: string }>(`UPDATE requests SET status = $2 WHERE id = $1 RETURNING phone, name`, [id, status]);
  if (r && status === "approved") await sendSms(r.phone, `Salon Ché: Hi ${r.name}, Lee can take your after-hours visit. Reply YES to confirm.`);
  revalidatePath("/owner/requests");
}
export async function ownerOfferTimes(id: number, text: string) {
  await requireOwner();
  const r = await one<{ phone: string }>(`UPDATE requests SET status = 'offered', notes = COALESCE(notes,'') || $2 WHERE id = $1 RETURNING phone`, [id, `\nOffered: ${text}`]);
  if (r) await sendSms(r.phone, `Salon Ché: Lee can do ${text}. Reply with the one that works.`);
  revalidatePath("/owner/requests");
}
export async function ownerReplyReview(fd: FormData) {
  await requireOwner();
  await q(`UPDATE reviews SET reply = $2 WHERE id = $1`, [Number(fd.get("id")), String(fd.get("reply") || "")]);
  revalidatePath("/owner/reviews"); revalidatePath("/reviews");
}
export async function ownerOrderStatus(id: number, status: string) {
  await requireOwner();
  const r = await one<{ phone: string }>(`UPDATE orders SET status = $2 WHERE id = $1 RETURNING phone`, [id, status]);
  if (r && status === "ready") await sendSms(r.phone, `Salon Ché: your order is ready to pick up at 507 Almond St.`);
  revalidatePath("/owner/orders");
}
export async function ownerSaveClient(fd: FormData) {
  await requireOwner();
  const id = Number(fd.get("id") || 0);
  const phone = digits(String(fd.get("phone") || ""));
  if (id) {
    await q(`UPDATE clients SET first_name=$2, last_name=$3, phone=$4, email=$5, notes=$6, allergies=$7 WHERE id=$1`,
      [id, fd.get("first"), fd.get("last"), phone, fd.get("email") || null, fd.get("notes") || null, fd.get("allergies") || null]);
    revalidatePath(`/owner/clients/${id}`);
    return;
  }
  const nid = await upsertClient({ first: String(fd.get("first")), last: String(fd.get("last") || ""), phone, email: String(fd.get("email") || "") });
  await q(`UPDATE clients SET notes = $2, allergies = $3 WHERE id = $1`, [nid, fd.get("notes") || null, fd.get("allergies") || null]);
  redirect(`/owner/clients/${nid}`);
}

// ---- Edit website by text ----
export async function ownerDraftChange(text: string): Promise<SiteDraft> {
  await requireOwner();
  return draftSiteChange(text);
}
export async function ownerPublishChange(d: SiteDraft): Promise<Res> {
  await requireOwner();
  if (!d.ok) return { ok: false, error: d.message };
  const before = d.key === "hours" ? await getHours() : d.key === "site" ? await getSite() : null;
  if (d.key === "hours" || d.key === "site") {
    await saveSetting(d.key, { ...(before as object), ...d.patch });
  } else if (d.key === "service") {
    const p = d.patch as { id?: number; price_cents?: number; name?: string; category?: string; duration_min?: number };
    if (p.id) await q(`UPDATE services SET price_cents = $2 WHERE id = $1`, [p.id, p.price_cents]);
    else await q(`INSERT INTO services (category, name, duration_min, price_cents, sort) VALUES ($1,$2,$3,$4,999)`, [p.category, p.name, p.duration_min, p.price_cents]);
  }
  await q(`INSERT INTO site_changes (summary, key, before, after) VALUES ($1,$2,$3::jsonb,$4::jsonb)`, [d.summary, d.key, JSON.stringify(before), JSON.stringify(d.patch)]);
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function ownerUndoChange(id: number) {
  await requireOwner();
  const c = await one<{ key: string; before: any; undone: boolean }>(`SELECT key, before, undone FROM site_changes WHERE id = $1`, [id]);
  if (!c || c.undone || !c.before) return;
  if (c.key === "hours" || c.key === "site") await saveSetting(c.key, c.before);
  await q(`UPDATE site_changes SET undone = TRUE WHERE id = $1`, [id]);
  revalidatePath("/", "layout");
}
export async function ownerSaveSite(fd: FormData) {
  await requireOwner();
  const before = await getSite();
  const after = { ...before, announcement: String(fd.get("announcement") ?? ""), heroTitle: String(fd.get("heroTitle") ?? ""), heroLead: String(fd.get("heroLead") ?? ""), aboutLead: String(fd.get("aboutLead") ?? ""), holidayNote: String(fd.get("holidayNote") ?? "") };
  await saveSetting("site", after);
  await q(`INSERT INTO site_changes (summary, key, before, after) VALUES ('Edited website text by cards','site',$1::jsonb,$2::jsonb)`, [JSON.stringify(before), JSON.stringify(after)]);
  revalidatePath("/", "layout");
}
export async function todayLocal() { return { date: localDate(), min: localMinutes(new Date()) }; }
