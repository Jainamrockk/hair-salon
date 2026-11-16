"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CursorSparkles } from "@/components/CursorSparkles";
import HairStrands from "@/components/hair/HairStrands";
import { SplitText } from "@/components/ui/reveal";

const EASE = [0.22, 1, 0.36, 1] as const;
type Shot = { src: string; alt: string; label: string };

/** Three mirror alcoves of real hair — colour, a lived-in blonde, a fresh fade — with gilt strands sweeping behind the words. */
export default function Hero({ title, lead, shots, openings, tag }: { title: string; lead: string; shots: Shot[]; openings: { href: string; day: string; time: string }[]; tag?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const ys = [y1, y2, y3];
  const enter = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 1.4, ease: EASE } });
  const layout = [
    "w-[30%] md:w-[13vw] max-w-[230px] mt-[10%]",
    "w-[38%] md:w-[17vw] max-w-[300px]",
    "w-[30%] md:w-[13vw] max-w-[230px] mt-[22%]",
  ];

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-24">
      <div className="absolute inset-0 pin-spot" />
      <HairStrands className="absolute inset-x-0 top-[18%] h-[70%] w-full opacity-70" />
      <CursorSparkles />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-6rem)] max-w-[1600px] items-center gap-10 px-5 pb-16 md:px-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ opacity: fade }} className="order-2 lg:order-1">
          <motion.p {...enter(0.4)} className="text-taupe mb-6 flex items-center gap-3"><span className="h-px w-10 bg-gold/60" />Hair · Color · Barber — South Nampa, Idaho</motion.p>
          <SplitText as="h1" text={title} delay={0.6} className="block font-display text-[clamp(3.6rem,9vw,8.8rem)] leading-[0.92]" />
          <motion.p {...enter(1.2)} className="mt-7 max-w-[32em] text-lg leading-relaxed text-taupe">{lead}</motion.p>
          <motion.div {...enter(1.4)} className="mt-9 flex flex-wrap gap-3">
            <Link href="/book" className="btn-dark">Book an appointment</Link>
            <Link href="/services" className="btn-ghost">Services & prices</Link>
          </motion.div>
          <motion.div {...enter(1.7)} className="glass mt-10 max-w-md rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between gap-3"><p className="text-sm text-taupe">Next open in Lee&apos;s chair</p><span className="flex items-center gap-2 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span></div>
            <ul className="mt-2 grid grid-cols-3 gap-3">
              {openings.length ? openings.map((o) => (
                <li key={o.href}><Link href={o.href} className="block rounded-xl border border-noir/10 px-3 py-2 hover:border-gold/60 transition-colors"><span className="block text-[12px] text-taupe">{o.day}</span><span className="font-display text-xl">{o.time}</span></Link></li>
              )) : <li className="col-span-3 py-2 text-sm text-taupe">Fully booked — <Link href="/book/waitlist" className="underline">join the waitlist</Link></li>}
            </ul>
            {tag ? <div className="mt-3 flex justify-end">{tag}</div> : null}
          </motion.div>
        </motion.div>

        <div className="order-1 lg:order-2 flex items-start justify-center gap-3 md:gap-5">
          {shots.slice(0, 3).map((s, i) => (
            <motion.figure key={s.src} style={{ y: ys[i] }} className={layout[i]}
              initial={reduce ? false : { opacity: 0, clipPath: "inset(100% 0 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 1.6, delay: 0.3 + i * 0.18, ease: EASE }}>
              <div className="niche overflow-hidden ring-1 ring-gold/25 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.alt} className="aspect-[3/4.6] w-full object-cover" />
              </div>
              <figcaption className="mt-3 text-center text-[12px] text-taupe">{s.label}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
