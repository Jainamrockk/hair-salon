import { Reveal } from "@/components/ui/reveal";

export default function PageHero({ eyebrow, title, lead, children, tag }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; tag?: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 pin-spot" />
      <div className="container-x relative pt-20 md:pt-28 pb-14 md:pb-20">
        <div className="flex items-center gap-3 mb-6"><p className="text-taupe">{eyebrow}</p>{tag}</div>
        <Reveal><h1 className="h1 max-w-5xl">{title}</h1></Reveal>
        {lead ? <Reveal delay={0.15}><p className="lead mt-8 max-w-2xl">{lead}</p></Reveal> : null}
        {children}
      </div>
    </section>
  );
}
