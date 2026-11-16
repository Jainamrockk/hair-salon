import Link from "next/link";
import Img from "@/components/Img";
import PageHero from "@/components/PageHero";
import { IMG } from "@/lib/content";

export const metadata = { title: "Work" };
const WORK = [
  { src: IMG.color, t: "Lavender waves", cat: "Color", s: "color" },
  { src: IMG.blonde, t: "Lived-in balayage", cat: "Highlights", s: "highlights" },
  { src: IMG.barber, t: "Fade & curl texture", cat: "For him", s: "him" },
  { src: IMG.curls, t: "Iron curls", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.styling, t: "Pin-curl set", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.rainbow, t: "Vivid colour melt", cat: "Color", s: "color" },
  { src: IMG.fade, t: "Skin fade & beard line-up", cat: "For him", s: "him" },
  { src: IMG.silverWash, t: "Silver toning wash", cat: "Treatments", s: "treatments" },
  { src: IMG.pinkFlip, t: "Rose-gold pink", cat: "Color", s: "color" },
  { src: IMG.natural, t: "Natural texture, shaped", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.updo, t: "Braided updo", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.pompadour, t: "Classic pompadour", cat: "For him", s: "him" },
  { src: IMG.blowdry, t: "Round-brush blow dry", cat: "Cuts & styling", s: "cuts" },
  { src: IMG.barberCut, t: "Scissor-over-comb", cat: "For him", s: "him" },
  { src: IMG.wash, t: "Botanical deep conditioning", cat: "Treatments", s: "treatments" },
];
export default async function Work({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const cats = [...new Set(WORK.map((w) => w.cat))];
  const list = c ? WORK.filter((w) => w.cat === c) : WORK;
  return (
    <>
      <PageHero eyebrow="Work" title={<>Fresh from <em>the chair.</em></>} lead="Recent cuts, color and texture by Lee. See something you love? Book that look and bring the photo." />
      <div className="container-x pb-28">
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/work" className={`chip ${!c ? "chip-on" : ""}`}>All</Link>
          {cats.map((x) => <Link key={x} href={`/work?c=${encodeURIComponent(x)}`} className={`chip ${c === x ? "chip-on" : ""}`}>{x}</Link>)}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
          {list.map((w, i) => (
            <figure key={w.t} className="group relative overflow-hidden rounded-[24px] break-inside-avoid">
              <Img src={w.src} alt={w.t} className={`w-full ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"} group-hover:scale-105 transition duration-700`} />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-noir/80 to-transparent text-ivory flex items-end justify-between">
                <div><p className="text-[10px] tracking-[0.02em] text-gold-light">{w.cat}</p><p className="font-display text-2xl">{w.t}</p></div>
                <Link href={`/book?cat=${w.s}`} className="btn-light btn-sm">Book this look</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
