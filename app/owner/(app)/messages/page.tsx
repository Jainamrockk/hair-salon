import Link from "next/link";
import { OwnerHeader, Panel } from "@/components/owner/ui";
import { q } from "@/lib/db";
import { fmtDate, fmtTime } from "@/lib/time";
import { ownerSendMessage } from "@/app/actions";

export const metadata = { title: "Messages" };
export default async function OwnerMessages({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const sp = await searchParams;
  const threads = await q<{ client_id: number; first_name: string; last_name: string | null; body: string; created_at: string; unread: number }>(
    `SELECT DISTINCT ON (m.client_id) m.client_id, c.first_name, c.last_name, m.body, m.created_at,
      (SELECT COUNT(*)::int FROM messages x WHERE x.client_id = m.client_id AND x.sender = 'client' AND NOT x.read) AS unread
     FROM messages m JOIN clients c ON c.id = m.client_id ORDER BY m.client_id, m.created_at DESC`);
  threads.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const active = sp.c ? Number(sp.c) : threads[0]?.client_id;
  const msgs = active ? await q<{ id: number; sender: string; body: string; created_at: string }>(`SELECT * FROM messages WHERE client_id = $1 ORDER BY created_at`, [active]) : [];
  const who = threads.find((t) => t.client_id === active) ?? (active ? (await q<{ client_id: number; first_name: string; last_name: string | null }>(`SELECT id AS client_id, first_name, last_name FROM clients WHERE id = $1`, [active]))[0] : undefined);
  return (
    <>
      <OwnerHeader title="Messages" tag="messaging" />
      <Panel className="grid md:grid-cols-[300px_1fr] h-[70vh] overflow-hidden">
        <ul className="border-r border-sand overflow-y-auto">
          {threads.map((t) => (
            <li key={t.client_id}><Link href={`/owner/messages?c=${t.client_id}`} className={`block p-4 border-b border-sand/60 ${t.client_id === active ? "bg-cream" : "hover:bg-cream/50"}`}>
              <div className="flex justify-between"><p className="font-semibold">{t.first_name} {t.last_name}</p>{t.unread ? <span className="h-5 min-w-5 px-1.5 rounded-full bg-gold text-white text-[11px] grid place-items-center">{t.unread}</span> : null}</div>
              <p className="text-sm text-taupe truncate">{t.body}</p>
            </Link></li>
          ))}
          {!threads.length && <li className="p-6 text-taupe">No messages yet.</li>}
        </ul>
        <div className="flex flex-col min-h-0">
          {who ? <>
            <div className="p-4 border-b border-sand flex justify-between items-center"><p className="font-display text-2xl">{who.first_name} {who.last_name}</p><Link href={`/owner/clients/${who.client_id}`} className="text-sm underline text-taupe">Profile</Link></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className={m.sender === "salon" ? "flex justify-end" : ""}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.sender === "salon" ? "bg-noir text-ivory rounded-br-md" : "bg-cream rounded-bl-md"}`}><p>{m.body}</p><p className="text-[11px] opacity-60 mt-1">{fmtDate(m.created_at)} · {fmtTime(m.created_at)}</p></div>
                </div>
              ))}
            </div>
            <form action={ownerSendMessage} className="p-3 border-t border-sand flex gap-2">
              <input type="hidden" name="clientId" value={who.client_id} />
              <input name="body" className="input" placeholder={`Reply to ${who.first_name} — also sent by text`} required aria-label="Reply" />
              <button className="btn-dark">Send</button>
            </form>
            <div className="px-3 pb-3 flex flex-wrap gap-2 text-xs">
              {["See you soon!", "Running 10 minutes behind — so sorry!", "Could you send me a photo of your hair now?"].map((t) => <span key={t} className="chip !py-1 !text-xs text-taupe">{t}</span>)}
            </div>
          </> : <p className="m-auto text-taupe">Pick a conversation.</p>}
        </div>
      </Panel>
    </>
  );
}
