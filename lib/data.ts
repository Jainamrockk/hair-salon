import "server-only";
import { q, one } from "./db";
import { DEFAULT_HOURS, DEFAULT_RULES, DEFAULT_SITE } from "./seed";
import { addDays, hhmmToMin, localDate, localMinutes, localToUtc, weekdayKey } from "./time";

export type Service = { id: number; category: string; name: string; note: string | null; duration_min: number; price_cents: number; price_label: string | null; active: boolean; sort: number };
export type Hours = typeof DEFAULT_HOURS;
export type Rules = typeof DEFAULT_RULES;
export type Site = typeof DEFAULT_SITE;
export type Appointment = {
  id: number; client_id: number; starts_at: string; ends_at: string; status: string; service_ids: number[];
  service_names: string; category: string; total_cents: number; deposit_cents: number; paid_cents: number;
  notes: string | null; first_color: boolean; first_name?: string; last_name?: string; phone?: string;
};

async function setting<T>(key: string, fallback: T): Promise<T> {
  const r = await one<{ value: T }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return r ? { ...fallback, ...(r.value as any) } : fallback;
}
export const getHours = () => setting<Hours>("hours", DEFAULT_HOURS);
export const getRules = () => setting<Rules>("rules", DEFAULT_RULES);
export const getSite = () => setting<Site>("site", DEFAULT_SITE);
export async function saveSetting(key: string, value: unknown) {
  await q(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, JSON.stringify(value)]);
}

export const getServices = (all = false) =>
  q<Service>(`SELECT * FROM services ${all ? "" : "WHERE active"} ORDER BY sort, id`);
export async function servicesByIds(ids: number[]) {
  if (!ids.length) return [];
  return q<Service>(`SELECT * FROM services WHERE id = ANY($1::int[]) AND active`, [ids]);
}

// ---------- Availability ----------
type Busy = { s: number; e: number };
async function busyBetween(from: Date, to: Date, excludeId?: number): Promise<Busy[]> {
  const a = await q<{ starts_at: string; ends_at: string }>(
    `SELECT starts_at, ends_at FROM appointments WHERE status IN ('confirmed','pending') AND starts_at < $2 AND ends_at > $1 AND id <> $3`,
    [from.toISOString(), to.toISOString(), excludeId ?? 0]);
  const b = await q<{ starts_at: string; ends_at: string }>(`SELECT starts_at, ends_at FROM blocks WHERE starts_at < $2 AND ends_at > $1`, [from.toISOString(), to.toISOString()]);
  return [...a, ...b].map((x) => ({ s: new Date(x.starts_at).getTime(), e: new Date(x.ends_at).getTime() }));
}

function slotsForDay(date: string, duration: number, hours: Hours, rules: Rules, busy: Busy[]) {
  const h = (hours as any)[weekdayKey(date)] as { open: string; close: string } | null;
  if (!h || rules.bookingPaused) return [];
  const open = hhmmToMin(h.open), close = hhmmToMin(h.close);
  const earliest = Date.now() + rules.minNoticeHours * 3600_000;
  const out: number[] = [];
  for (let m = open; m + duration <= close; m += rules.slotStepMin) {
    const s = localToUtc(date, m).getTime(), e = s + duration * 60000;
    if (s < earliest) continue;
    const buf = rules.bufferMin * 60000;
    if (busy.some((b) => s < b.e + buf && e + buf > b.s)) continue;
    out.push(m);
  }
  return out;
}

export async function getSlots(date: string, duration: number, excludeId?: number) {
  const [hours, rules] = await Promise.all([getHours(), getRules()]);
  const busy = await busyBetween(localToUtc(date, 0), localToUtc(addDays(date, 1), 0), excludeId);
  return slotsForDay(date, duration, hours, rules, busy);
}

export async function getRangeAvailability(start: string, days: number, duration: number) {
  const [hours, rules] = await Promise.all([getHours(), getRules()]);
  const busy = await busyBetween(localToUtc(start, 0), localToUtc(addDays(start, days), 0));
  const out: Record<string, number> = {};
  const today = localDate();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    if (d < today || d > addDays(today, rules.maxDaysAhead)) { out[d] = -1; continue; }
    out[d] = slotsForDay(d, duration, hours, rules, busy).length;
  }
  return out;
}

export async function nextOpenings(count = 3, duration = 45) {
  const today = localDate();
  const res: { date: string; min: number }[] = [];
  for (let i = 0; i < 21 && res.length < count; i++) {
    const d = addDays(today, i);
    const s = await getSlots(d, duration);
    // spread suggestions: first slot of morning and afternoon
    const picks = [s[0], s.find((m) => m >= 840)].filter((x) => x !== undefined) as number[];
    for (const m of [...new Set(picks)]) if (res.length < count) res.push({ date: d, min: m });
  }
  return res;
}

export function depositFor(rules: Rules, services: Service[]) {
  const dur = services.reduce((a, s) => a + s.duration_min, 0);
  const needs = dur >= rules.depositMinMinutes || services.some((s) => rules.depositCategories.includes(s.category));
  return needs ? rules.depositCents : 0;
}

// ---------- Appointments ----------
const APPT = `SELECT a.*, c.first_name, c.last_name, c.phone, c.email FROM appointments a LEFT JOIN clients c ON c.id = a.client_id`;
export const appointmentsBetween = (from: Date, to: Date) =>
  q<Appointment>(`${APPT} WHERE a.starts_at >= $1 AND a.starts_at < $2 AND a.status <> 'cancelled' ORDER BY a.starts_at`, [from.toISOString(), to.toISOString()]);
export const appointmentById = (id: number) => one<Appointment & { email: string | null }>(`${APPT} WHERE a.id = $1`, [id]);
export const clientAppointments = (cid: number) => q<Appointment>(`${APPT} WHERE a.client_id = $1 ORDER BY a.starts_at DESC`, [cid]);

export async function upsertClient(c: { first: string; last?: string; phone: string; email?: string; marketing?: boolean; allergies?: string }) {
  const r = await one<{ id: number }>(
    `INSERT INTO clients (first_name, last_name, phone, email, marketing, allergies) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = COALESCE(EXCLUDED.last_name, clients.last_name),
       email = COALESCE(EXCLUDED.email, clients.email), marketing = EXCLUDED.marketing,
       allergies = COALESCE(EXCLUDED.allergies, clients.allergies) RETURNING id`,
    [c.first, c.last || null, c.phone, c.email || null, !!c.marketing, c.allergies || null]);
  return r!.id;
}

export async function createAppointment(input: { clientId: number; date: string; start: number; services: Service[]; notes?: string; firstColor?: boolean; status?: string; depositCents: number; paidCents: number; source?: string }) {
  const dur = input.services.reduce((a, s) => a + s.duration_min, 0);
  const total = input.services.reduce((a, s) => a + s.price_cents, 0);
  const r = await one<{ id: number }>(
    `INSERT INTO appointments (client_id, starts_at, ends_at, status, service_ids, service_names, category, total_cents, deposit_cents, paid_cents, notes, first_color, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [input.clientId, localToUtc(input.date, input.start).toISOString(), localToUtc(input.date, input.start + dur).toISOString(),
      input.status ?? "confirmed", input.services.map((s) => s.id), input.services.map((s) => s.name).join(" + "),
      input.services[0]?.category ?? "cuts", total, input.depositCents, input.paidCents, input.notes || null, !!input.firstColor, input.source ?? "online"]);
  return r!.id;
}

export function digits(p: string) {
  const d = (p || "").replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
}
export const fmtPhone = (p: string) => { const d = digits(p); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p; };

export async function dayStats(date = localDate()) {
  const appts = await appointmentsBetween(localToUtc(date, 0), localToUtc(addDays(date, 1), 0));
  return { appts, booked: appts.reduce((a, x) => a + x.total_cents, 0) };
}
export const nowLocalMinutes = () => localMinutes(new Date());
