import { SALON } from "./content";
export function icsHref(a: { id: number; starts_at: string; ends_at: string; service_names: string }) {
  const f = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salon Che//EN", "BEGIN:VEVENT", `UID:salonche-${a.id}`, `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(a.starts_at)}`, `DTEND:${f(a.ends_at)}`, `SUMMARY:Salon Ché — ${a.service_names}`, `LOCATION:${SALON.street}, ${SALON.city}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}
