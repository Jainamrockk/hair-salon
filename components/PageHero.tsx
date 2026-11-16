export default function PageHero({ eyebrow, title, lead, children, tag }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; tag?: React.ReactNode }) {
  return (
    <section className="container-x pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="flex items-center gap-3 mb-5"><p className="eyebrow-gold">{eyebrow}</p>{tag}</div>
      <h1 className="h1 max-w-4xl">{title}</h1>
      {lead ? <p className="lead mt-6 max-w-2xl">{lead}</p> : null}
      {children}
    </section>
  );
}
