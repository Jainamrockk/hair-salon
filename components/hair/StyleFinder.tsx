"use client";
import Link from "next/link";
import { useState } from "react";
import Caricature, { SKINS, STYLES, type FaceShape, type StyleId } from "./Caricature";

const SHAPES: { id: FaceShape; name: string; tip: string; picks: StyleId[] }[] = [
  { id: "oval", name: "Oval", tip: "Lucky you — almost everything works. Play with length and fringe.", picks: ["waves", "pixie", "bob", "quiff"] },
  { id: "round", name: "Round", tip: "Add height on top and length past the chin to lengthen the face.", picks: ["lob", "ponytail", "quiff", "shag"] },
  { id: "square", name: "Square", tip: "Soften the jaw with layers, waves and curtain bangs.", picks: ["shag", "waves", "curls", "fade"] },
  { id: "heart", name: "Heart", tip: "Balance a wider forehead with fullness around the chin.", picks: ["bob", "lob", "braids", "curls"] },
  { id: "long", name: "Long", tip: "Add width at the sides; a fringe shortens the face beautifully.", picks: ["bob", "curls", "shag", "bun"] },
];

/** Face-shape style finder, drawn with the caricature cast. */
export default function StyleFinder() {
  const [shape, setShape] = useState<FaceShape>("oval");
  const [skin, setSkin] = useState(SKINS[1]);
  const s = SHAPES.find((x) => x.id === shape)!;
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-10">
      <div>
        <p className="label">Your face shape</p>
        <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
          {SHAPES.map((f) => (
            <button key={f.id} onClick={() => setShape(f.id)} aria-pressed={shape === f.id} className={`rounded-2xl border p-2 transition ${shape === f.id ? "border-noir bg-surface" : "border-noir/10 hover:border-noir/40"}`}>
              <Caricature id={`sf-${f.id}`} face={f.id} bald color="#6b4630" skin={skin} shirt="#b9b0a0" mood="calm" className="w-full" />
              <span className="block text-xs mt-1">{f.name}</span>
            </button>
          ))}
        </div>
        <p className="label mt-6">Skin tone</p>
        <div className="flex gap-2">{SKINS.map((k) => <button key={k} onClick={() => setSkin(k)} aria-label="Skin tone" className={`h-8 w-8 rounded-full ${skin === k ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory" : ""}`} style={{ background: k }} />)}</div>
        <div className="mt-8 rounded-2xl bg-surface border border-noir/10 p-5"><p className="font-display text-2xl">{s.name} face</p><p className="text-taupe mt-1">{s.tip}</p></div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {s.picks.map((p, i) => (
          <div key={p + shape} className="animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="niche plinth overflow-hidden pt-5"><Caricature id={`sfp-${p}-${shape}`} style={p} face={shape} skin={skin} color={["#6b4630", "#1b1714", "#c8994f", "#8f1d2c"][i]} beard={STYLES[p].men && i % 2 === 0} shirt="#2c2420" mood={i % 2 ? "grin" : "smile"} className="mx-auto w-[86%]" /></div>
            <p className="mt-3 font-display text-2xl">{STYLES[p].name}</p>
            <div className="mt-2 flex gap-3 text-sm"><Link href={`/try-on?mode=style&style=${p}`} className="link-arrow">Try on</Link><Link href={`/book?cat=${STYLES[p].service}`} className="link-arrow">Book</Link></div>
          </div>
        ))}
      </div>
    </div>
  );
}
