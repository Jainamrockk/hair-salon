import Link from "next/link";
import Img from "@/components/Img";
import PageHero from "@/components/PageHero";
import { getWork } from "@/lib/photos";

export const metadata = { title: "Work" };
export default async function Work({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const [{ c }, WORK] = await Promise.all([searchParams, getWork()]);
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
          {list.length ? null : <p className="text-taupe">No photos here yet.</p>}
          {list.map((w, i) => (
            <figure key={i + w.src} className="group relative overflow-hidden rounded-[24px] break-inside-avoid">
              <Img src={w.src} alt={w.title} className={`w-full ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"} group-hover:scale-105 transition duration-700`} />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#15110f]/85 to-transparent text-[#f0eae1] flex items-end justify-between">
                <div><p className="text-[10px] tracking-[0.02em] text-[#d6bd92]">{w.cat}</p><p className="font-display text-2xl">{w.title}</p></div>
                <Link href={`/book?cat=${w.s}`} className="btn btn-sm bg-[#f0eae1] text-[#15110f] hover:bg-[#d6bd92]">Book this look</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
