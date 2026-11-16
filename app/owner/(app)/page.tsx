import Link from "next/link";
import { OwnerHeader, Panel, Pill, Stat } from "@/components/owner/ui";
import { categoryById } from "@/lib/content";
import { dayStats, getSlots, fmtPhone } from "@/lib/data";
import { q } from "@/lib/db";
import { fmtDateStr, fmtDuration, fmtMin, fmtTime, localDate, money } from "@/lib/time";

export const metadata = { title: "Today" };
export default async function Today() {
  const today = localDate();
  const { appts, booked } = await dayStats(today);
  const [open30, reqs, revs, msgs] = await Promise.all([
    getSlots(today, 30),
    q<{ id: number; kind: string; name: string; service: string; preferred: string | null }>(`SELECT * FROM requests WHERE status = 'new' ORDER BY created_at DESC LIMIT 3`),
    q<{ id: number; author: string; rating: number }>(`SELECT id, author, rating FROM reviews WHERE reply IS NULL ORDER BY created_at DESC LIMIT 3`),
    q<{ client_id: number; first_name: string; body: string }>(`SELECT DISTINCT ON (m.client_id) m.client_id, c.first_name, m.body FROM messages m JOIN clients c ON c.id = m.client_id WHERE m.sender = 'client' AND NOT m.read ORDER BY m.client_id, m.created_at DESC`),
  ]);
  const pending = appts.filter((a) => a.status === "pending");
  const nowMs = Date.now();
  const next = appts.find((a) => new Date(a.ends_at).getTime() > nowMs && a.status !== "cancelled");
  return (
    <>
      <OwnerHeader eyebrow={fmtDateStr(today, { weekday: "long", month: "long", day: "numeric" })} title="Today" tag="owner-app">
        <Link href="/owner/new" className="btn-dark btn-sm">New appointment</Link>
        <Link href="/owner/calendar" className="btn-ghost btn-sm">Open calendar</Link>
      </OwnerHeader>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Appointments" value={appts.length} />
        <Stat label="Booked today" value={money(booked)} />
        <Stat label="Open slots left" value={open30.length ? open30.length : "Full"} sub={open30[0] !== undefined ? `Next at ${fmtMin(open30[0])}` : undefined} />
        <Stat label="New reviews" value={revs.length} />
      </div>
      <div className="grid xl:grid-cols-3 gap-6 mt-8">
        <Panel className="xl:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4"><p className="font-display text-3xl">Schedule</p>{next && <p className="text-sm text-taupe">Up next: <b className="text-noir">{next.first_name}</b> at {fmtTime(next.starts_at)}</p>}</div>
          {appts.length ? (
            <ol className="space-y-3">
              {appts.map((a) => { const c = categoryById(a.category); const mins = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000; return (
                <li key={a.id}>
                  <Link href={`/owner/appointments/${a.id}`} className="flex gap-4 items-stretch rounded-2xl border border-sand hover:border-noir p-4 transition">
                    <div className="w-20 shrink-0"><p className="font-display text-2xl leading-none">{fmtTime(a.starts_at).replace(/ [AP]M/, "")}</p><p className="text-xs text-taupe">{fmtTime(a.starts_at).slice(-2)}</p></div>
                    <span className="w-1.5 rounded-full" style={{ background: c.hex }} />
                    <div className="flex-1 min-w-0"><p className="font-semibold">{a.first_name} {a.last_name}</p><p className="text-sm text-taupe truncate">{a.service_names}</p><p className="text-xs text-stone">{fmtDuration(mins)} · {money(a.total_cents)}</p></div>
                    <div className="self-center"><Pill s={a.status} /></div>
                  </Link>
                </li>
              ); })}
            </ol>
          ) : <p className="text-taupe py-10 text-center">No appointments today. Enjoy the quiet — or <Link href="/owner/new" className="underline">add one</Link>.</p>}
        </Panel>
        <div className="space-y-4">
          <p className="font-display text-3xl">Needs you</p>
          {pending.map((a) => (
            <Panel key={a.id} className="p-5 border-amber-300">
              <p className="font-semibold">{a.first_name} hasn&apos;t confirmed</p>
              <p className="text-sm text-taupe">{fmtTime(a.starts_at)} {a.service_names.toLowerCase()}. A nudge text goes out by itself at noon.</p>
              <div className="flex gap-2 mt-3"><a href={`sms:+1${a.phone}`} className="btn-dark btn-sm">Text now</a><Link href={`/owner/appointments/${a.id}`} className="btn-ghost btn-sm">Open</Link></div>
            </Panel>
          ))}
          {reqs.length ? <Panel className="p-5"><p className="font-semibold">{reqs.length} booking request{reqs.length > 1 ? "s" : ""}</p>{reqs.map((r) => <p key={r.id} className="text-sm text-taupe">{r.name} · {r.service} · {r.kind === "after_hours" ? r.preferred : "waitlist"}</p>)}<Link href="/owner/requests" className="btn-ghost btn-sm mt-3">Review</Link></Panel> : null}
          {revs.length ? <Panel className="p-5"><p className="font-semibold">{revs.length} review{revs.length > 1 ? "s" : ""} to thank</p><p className="text-sm text-taupe">{revs.map((r) => `${r.author} ${"★".repeat(r.rating)}`).join(" · ")}</p><Link href="/owner/reviews" className="btn-ghost btn-sm mt-3">Reply</Link></Panel> : null}
          {msgs.map((m) => <Panel key={m.client_id} className="p-5"><p className="font-semibold">Message from {m.first_name}</p><p className="text-sm text-taupe line-clamp-2">“{m.body}”</p><Link href={`/owner/messages?c=${m.client_id}`} className="btn-ghost btn-sm mt-3">Reply</Link></Panel>)}
          {!pending.length && !reqs.length && !revs.length && !msgs.length && <Panel className="p-5 text-taupe">All caught up. ✦</Panel>}
          <Panel className="p-5 bg-noir text-ivory border-noir"><p className="text-xs uppercase tracking-luxe text-gold-light">Quick text</p><p className="text-sm text-ivory/70 mt-2">Running behind? Let everyone after now know in one tap.</p>
            <a href={`sms:${appts.filter((a) => new Date(a.starts_at).getTime() > nowMs).map((a) => "+1" + a.phone).join(",")}&body=Running about 15 minutes behind today — so sorry! — Lee`} className="btn-gold btn-sm mt-3">Text later clients</a>
            <p className="text-[11px] text-ivory/40 mt-2">{appts.filter((a) => new Date(a.starts_at).getTime() > nowMs).map((a) => fmtPhone(a.phone!)).join(", ") || "No later clients"}</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
