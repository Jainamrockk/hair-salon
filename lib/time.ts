import { SALON } from "./content";
const TZ = SALON.timezone;

function parts(d: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short",
  });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(d)) o[p.type] = p.value;
  return o;
}
export function tzOffsetMin(d: Date) {
  const o = parts(d);
  const asUtc = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second);
  return Math.round((asUtc - d.getTime()) / 60000);
}
/** Convert a salon-local date (YYYY-MM-DD) + minutes after midnight to a UTC Date. */
export function localToUtc(date: string, minutes: number) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  let t = guess - tzOffsetMin(new Date(guess)) * 60000;
  t = guess - tzOffsetMin(new Date(t)) * 60000;
  return new Date(t);
}
export function localDate(d: Date = new Date()) {
  const o = parts(d);
  return `${o.year}-${o.month}-${o.day}`;
}
export function localMinutes(d: Date) {
  const o = parts(d);
  return +o.hour * 60 + +o.minute;
}
export function weekdayKey(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}
export const hhmmToMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
export const minToHhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export function fmtMin(n: number) {
  const h = Math.floor(n / 60), m = n % 60, ap = h >= 12 ? "PM" : "AM", h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
}
export const fmtTime = (d: Date | string) =>
  new Date(d).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
export const fmtDate = (d: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  new Date(d).toLocaleDateString("en-US", { timeZone: TZ, ...opts });
export function fmtDateStr(date: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" }) {
  return localToUtc(date, 12 * 60).toLocaleDateString("en-US", { timeZone: TZ, ...opts });
}
export function fmtDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}
export const money = (cents: number, frac = false) =>
  "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: frac ? 2 : 0, maximumFractionDigits: frac ? 2 : 0 });
