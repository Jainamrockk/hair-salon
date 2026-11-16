import Link from "next/link";
import Img from "@/components/Img";
import { IMG, SALON } from "@/lib/content";
import { getSite } from "@/lib/data";

export const metadata = { title: "Meet Lee Ortivez" };

export default async function About() {
  const site = await getSite();
  return (
    <>
      <section className="container-x pt-16 md:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="eyebrow-gold mb-5">Meet your stylist</p>
          <h1 className="h1">Lee <em>Ortivez.</em></h1>
          <p className="lead mt-8">{site.aboutLead}</p>
          <blockquote className="mt-10 border-l-2 border-gold pl-6 font-display text-3xl leading-snug">“{SALON.quote}”</blockquote>
          <div className="mt-10 flex flex-wrap gap-3"><Link href="/book" className="btn-dark">Book with Lee</Link><Link href="/work" className="btn-ghost">See Lee&apos;s work</Link></div>
        </div>
        <div className="niche plinth overflow-hidden ring-1 ring-gold/20 mx-auto w-full max-w-[520px]"><Img src={IMG.curls} alt="Curling-iron waves being set at the chair" className="w-full aspect-[3/4]" label="At the chair" /></div>
      </section>
      <section className="border-y border-noir/10 bg-cream">
        <div className="container-x py-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[["34 years", "behind the chair, color and cutting"], ["Instructor", "licensed cosmetology instructor in Idaho"], ["TIGI", "former platform artist & ambassador"], ["Rusk", "advanced Designer-level training"]].map(([a, b]) => (
            <div key={a} className="border-t border-gold/40 pt-5"><p className="font-display text-5xl text-gold-light">{a}</p><p className="text-sm text-noir/60 mt-2">{b}</p></div>
          ))}
        </div>
      </section>
      <section className="container-x py-24 md:py-32">
        <p className="eyebrow-gold mb-4">What Lee does best</p>
        <h2 className="h2 max-w-3xl">Craft, taught and practised.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {[["Precision cutting", "Dry-cut finishing so the shape falls the way it will at home, not just in the chair."],
            ["Color & correction", "Dimensional color, gray blending and corrective work priced by consultation."],
            ["Smoothing & texture", "Keratin, perms and treatments matched to your hair's history and goals."],
            ["Gentle, botanical care", "Hair Evolution, Rusk and Ekklesia oils — lines chosen to be kind to hair and scalp."]].map(([t, d], i) => (
            <div key={t} className="card p-8"><span className="font-display text-gold text-xl">0{i + 1}</span><h3 className="font-display text-3xl mt-6">{t}</h3><p className="text-taupe mt-3 leading-relaxed">{d}</p></div>
          ))}
        </div>
      </section>
      <section className="container-x pb-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 niche plinth overflow-hidden"><Img src={IMG.interior} alt="The chair, mirror and colour bar" className="w-full aspect-[16/11]" /></div>
        <div className="lg:col-span-5">
          <p className="eyebrow-gold mb-4">The space</p>
          <h2 className="font-display text-5xl font-light">A calm room on <em>Almond Street.</em></h2>
          <p className="mt-6 text-taupe text-lg leading-relaxed">Salon Ché moved from historic downtown Nampa to {SALON.street} in {SALON.movedYear} — an easy, unhurried space where one stylist looks after one guest at a time. Free parking out front.</p>
          <Link href="/visit" className="link-arrow mt-8">Plan your visit →</Link>
        </div>
      </section>
    </>
  );
}
