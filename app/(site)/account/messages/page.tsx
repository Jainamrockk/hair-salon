import FeatureTag from "@/components/FeatureTag";
import { clientId } from "@/lib/auth";
import { q } from "@/lib/db";
import { fmtDate, fmtTime } from "@/lib/time";
import { clientSendMessage } from "@/app/actions";

export const metadata = { title: "Messages" };
export default async function Messages() {
  const cid = (await clientId())!;
  const msgs = await q<{ id: number; sender: string; body: string; created_at: string }>(`SELECT * FROM messages WHERE client_id = $1 ORDER BY created_at`, [cid]);
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="font-display text-5xl font-light">Messages</h1><FeatureTag id="messaging" /></div>
      <p className="text-taupe mt-2">Message Lee directly. Replies also arrive by text.</p>
      <div className="card bg-white mt-8 flex flex-col h-[560px]">
        <div className="px-6 py-4 border-b border-sand flex items-center gap-3"><span className="h-10 w-10 rounded-full bg-noir text-ivory grid place-items-center font-display">L</span><div><p className="font-semibold">Lee Ortivez</p><p className="text-xs text-taupe">Usually replies within a few hours</p></div></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {msgs.length ? msgs.map((m) => (
            <div key={m.id} className={m.sender === "client" ? "flex justify-end" : ""}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.sender === "client" ? "bg-noir text-ivory rounded-br-md" : "bg-cream rounded-bl-md"}`}>
                <p>{m.body}</p><p className={`text-[11px] mt-1 ${m.sender === "client" ? "text-ivory/50" : "text-stone"}`}>{fmtDate(m.created_at)} · {fmtTime(m.created_at)}</p>
              </div>
            </div>
          )) : <p className="text-taupe text-center mt-20">Say hi — ask about a color, send a photo idea, or let Lee know you&apos;re running late.</p>}
        </div>
        <form action={clientSendMessage} className="border-t border-sand p-4 flex gap-2">
          <input name="body" className="input" placeholder="Write a message…" aria-label="Message" required />
          <button className="btn-dark">Send</button>
        </form>
      </div>
    </div>
  );
}
