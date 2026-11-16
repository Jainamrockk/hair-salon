import FeatureTag from "@/components/FeatureTag";

export function OwnerHeader({ eyebrow, title, tag, children }: { eyebrow?: string; title: React.ReactNode; tag?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <div className="flex items-center gap-3 flex-wrap"><h1 className="font-display text-4xl md:text-5xl font-light">{title}</h1>{tag && <FeatureTag id={tag} />}</div>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

const STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800", pending: "bg-amber-100 text-amber-800", completed: "bg-stone/20 text-cocoa",
  cancelled: "bg-rose/15 text-[#8a2f25]", no_show: "bg-rose/15 text-[#8a2f25]", new: "bg-gold/20 text-gold-deep", approved: "bg-emerald-100 text-emerald-800",
  declined: "bg-stone/20 text-cocoa", offered: "bg-sky-100 text-sky-800", reserved: "bg-gold/20 text-gold-deep", ready: "bg-emerald-100 text-emerald-800", picked_up: "bg-stone/20 text-cocoa",
};
const LABEL: Record<string, string> = { pending: "Needs confirm", no_show: "No-show", picked_up: "Picked up" };
export function Pill({ s }: { s: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STYLES[s] ?? "bg-cream"}`}>{LABEL[s] ?? s}</span>;
}
export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return <div className="rounded-2xl bg-white border border-sand p-5"><p className="font-display text-4xl">{value}</p><p className="text-sm text-taupe mt-1">{label}</p>{sub ? <p className="text-xs text-stone mt-1">{sub}</p> : null}</div>;
}
export const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[22px] border ${/\bbg-/.test(className) ? "" : "bg-white"} ${/\bborder-(?!sand)/.test(className) ? "" : "border-sand"} ${className}`}>{children}</div>
);
