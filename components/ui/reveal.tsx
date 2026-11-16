"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Content is uncovered by a mask drawn upward, rising a few pixels — a curtain lifting off the mirror. Once. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" | "article" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp className={className} initial="hidden" whileInView="shown" viewport={{ once: true, margin: "-8% 0px" }}
      variants={{ hidden: { clipPath: "inset(100% 0% 0% 0%)", y, opacity: 0.2 }, shown: { clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1 } }}
      transition={reduce ? { duration: 0 } : { duration: 1.4, delay, ease: EASE }}>
      {children}
    </Comp>
  );
}

/** Letter-by-letter rise out of a mask, like gilt lettering catching the light. Screen readers get the sentence once. */
export function SplitText({ text, className, delay = 0, stagger = 0.028, inView = false, as: Tag = "span" }: { text: string; className?: string; delay?: number; stagger?: number; inView?: boolean; as?: "span" | "h1" | "h2" | "h3" | "p" }) {
  const reduce = useReducedMotion();
  let index = 0;
  const trigger = inView ? { whileInView: "shown", viewport: { once: true, margin: "-10% 0px" } } : { animate: "shown" };
  return (
    <Tag className={className} aria-label={text}>
      <motion.span className="inline" initial="hidden" {...trigger} aria-hidden>
        {text.split(" ").map((word, w, all) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {[...word].map((ch) => {
              const i = index++;
              return (
                <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <motion.span className="inline-block" variants={{ hidden: { y: "105%", opacity: 0, rotate: 4 }, shown: { y: "0%", opacity: 1, rotate: 0 } }}
                    transition={reduce ? { duration: 0 } : { duration: 1.15, delay: delay + i * stagger, ease: EASE }}>{ch}</motion.span>
                </span>
              );
            })}
            {w < all.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Word-by-word fade out of a soft blur, for sentences beneath a headline. */
export function SplitWords({ text, className, delay = 0, inView = false }: { text: string; className?: string; delay?: number; inView?: boolean }) {
  const reduce = useReducedMotion();
  const trigger = inView ? { whileInView: "shown", viewport: { once: true, margin: "-10% 0px" } } : { animate: "shown" };
  return (
    <motion.p className={className} initial="hidden" {...trigger} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <motion.span key={i} aria-hidden className="inline-block" variants={{ hidden: { opacity: 0, y: 10, filter: "blur(6px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)" } }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: delay + i * 0.045, ease: EASE }}>{word}&nbsp;</motion.span>
      ))}
    </motion.p>
  );
}
