"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CursorSparkles } from "@/components/CursorSparkles";
import Img from "@/components/Img";
import { SplitText } from "@/components/ui/reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The one orchestrated moment: the mirror lights up out of the dark, then the words settle beneath it. */
export default function Hero({ title, lead, image, openings, tag }: { title: string; lead: string; image: string; openings: { href: string; day: string; time: string }[]; tag?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const enter = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 1.4, ease: EASE } });

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[720px] overflow-hidden">
      <div className="absolute inset-0 pin-spot" />
      {/* The mirror alcove: the salon chair glowing inside an arched niche */}
      <motion.div style={{ y: lift }} className="absolute left-1/2 top-[14vh] h-[46vh] max-h-[520px] -translate-x-1/2 aspect-[3/4.2] md:left-[58%]"
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2, ease: EASE, delay: 0.2 }}>
        <div className="niche plinth relative h-full w-full overflow-hidden ring-1 ring-gold/25">
          <Img src={image} alt="The chair at Salon Ché under warm light" className="absolute inset-0 h-full w-full opacity-80 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_20%,rgb(240_220_190/0.25),transparent_70%)]" />
        </div>
        <div className="mx-auto mt-[-10px] h-6 w-[80%] rounded-[50%] bg-black/50 blur-xl" />
      </motion.div>
      <CursorSparkles />

      <motion.div style={{ opacity: fade }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
        <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <motion.p {...enter(0.5)} className="text-taupe mb-6">Hair · Color · Barber — South Nampa, Idaho</motion.p>
            <SplitText as="h1" text={title} delay={0.7} className="block font-display text-[clamp(3.6rem,10vw,9.5rem)] leading-[0.92]" />
            <motion.p {...enter(1.3)} className="mt-7 max-w-[32em] text-lg leading-relaxed text-taupe">{lead}</motion.p>
          </div>
          <motion.div {...enter(1.6)} className="pointer-events-auto flex flex-col items-start gap-6 md:items-end">
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/book" className="btn-dark">Book an appointment</Link>
              <Link href="/services" className="btn-ghost">Services & prices</Link>
            </div>
            <div className="glass rounded-2xl px-5 py-4 w-full max-w-sm">
              <div className="flex items-center justify-between gap-3"><p className="text-sm text-taupe">Next open with Lee</p><span className="flex items-center gap-2 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span></div>
              <ul className="mt-2 divide-y divide-noir/10">
                {openings.length ? openings.map((o) => (
                  <li key={o.href}><Link href={o.href} className="flex items-baseline justify-between py-2 hover:text-gold"><span className="text-sm">{o.day}</span><span className="font-display text-2xl">{o.time}</span></Link></li>
                )) : <li className="py-2 text-sm text-taupe">Fully booked — <Link href="/book/waitlist" className="underline">join the waitlist</Link></li>}
              </ul>
              {tag ? <div className="mt-2 flex justify-end">{tag}</div> : null}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
