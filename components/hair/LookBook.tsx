"use client";
import Link from "next/link";
import { useState } from "react";
import Caricature, { SKINS, STYLES, type FaceShape, type StyleId } from "./Caricature";
import { SHADES } from "@/lib/shades";

// A cast of characters, each modelling one style.
export const CAST: { style: StyleId; color: string; skin: string; face: FaceShape; glasses?: boolean; beard?: boolean; shirt: string; mood?: "smile" | "grin" | "calm" }[] = [
  { style: "waves", color: "#8f5a2e", skin: SKINS[1], face: "oval", shirt: "#3a2a20" },
  { style: "bob", color: "#1b1714", skin: SKINS[0], face: "heart", shirt: "#8f1d2c", mood: "grin" },
  { style: "curls", color: "#2b1d16", skin: SKINS[4], face: "round", shirt: "#c8994f" },
  { style: "quiff", color: "#3a2a20", skin: SKINS[2], face: "square", beard: true, shirt: "#1d1815" },
  { style: "pixie", color: "#e8e1d2", skin: SKINS[0], face: "oval", glasses: true, shirt: "#5e1224", mood: "grin" },
  { style: "fade", color: "#15110f", skin: SKINS[5], face: "long", shirt: "#b0592b" },
  { style: "braids", color: "#b0592b", skin: SKINS[1], face: "round", shirt: "#33241c", mood: "grin" },
  { style: "bun", color: "#6b4630", skin: SKINS[3], face: "long", shirt: "#b9b0a0", mood: "calm" },
  { style: "shag", color: "#c8994f", skin: SKINS[0], face: "square", shirt: "#3a2a20" },
  { style: "lob", color: "#9a6a3a", skin: SKINS[2], face: "heart", shirt: "#1b1714" },
  { style: "ponytail", color: "#8f1d2c", skin: SKINS[1], face: "oval", shirt: "#e8e1d2", mood: "grin" },
  { style: "buzz", color: "#2b1d16", skin: SKINS[4], face: "square", beard: true, shirt: "#6b4630" },
];

/** Every look in the book can be re-coloured live with the salon's shade chart. */
export default function LookBook({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const [shade, setShade] = useState<string | null>(null);
  const cast = limit ? CAST.slice(0, limit) : CAST;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-10">
        <span className="text-sm text-taupe mr-2">Try every look in:</span>
        <button onClick={() => setShade(null)} className={`chip !py-1.5 ${!shade ? "chip-on" : ""}`}>Their own colour</button>
        {SHADES.slice(0, 8).map((s) => (
          <button key={s.code} onClick={() => setShade(s.hex)} aria-pressed={shade === s.hex} title={`${s.code} ${s.name}`}
            className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-ivory transition ${shade === s.hex ? "ring-2 ring-gold scale-110" : "hover:scale-110"}`} style={{ background: s.hex, boxShadow: "inset 0 -6px 10px rgb(0 0 0 / .25)" }} />
        ))}
      </div>
      <div className={`grid gap-x-6 gap-y-12 ${compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}`}>
        {cast.map((c, i) => {
          const s = STYLES[c.style];
          return (
            <Link key={c.style} href={`/try-on?mode=style&style=${c.style}`} className="group block">
              <div className="niche plinth relative overflow-hidden ring-1 ring-noir/10 pt-6">
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                <Caricature id={`lb-${c.style}-${i}`} {...c} color={shade ?? c.color} className="relative mx-auto w-[86%] transition-transform duration-700 ease-luxe group-hover:-translate-y-2 group-hover:rotate-[-2deg]" />
              </div>
              <p className="mt-4 font-display text-2xl">{s.name}</p>
              <p className="text-sm text-taupe">{s.blurb}</p>
              <p className="mt-2 text-sm text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">Try it on your photo →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
