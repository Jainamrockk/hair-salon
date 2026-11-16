/**
 * Caricature engine: a friendly illustrated character whose hairstyle, face shape, skin tone and hair colour
 * are all parameters. The hair is drawn in two layers (behind and in front of the face) so the same styles
 * can be laid over a real photo in the try-on studio.
 */

export function tone(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

export type FaceShape = "oval" | "round" | "square" | "heart" | "long";
export type StyleId = "waves" | "bob" | "pixie" | "curls" | "bun" | "quiff" | "fade" | "braids" | "shag" | "buzz" | "lob" | "ponytail";

type Layer = { back?: string; front?: string; extra?: (c: string, id: string) => React.ReactNode; extraFront?: (c: string, id: string) => React.ReactNode; strands?: string[]; backStrands?: string[]; cap?: boolean };

// Crown cap drawn under every fringe so no scalp shows above the hairline.
const CAP = "M51,104 C46,24 154,24 149,104 C140,82 122,72 100,72 C78,72 60,82 51,104Z";

// All paths live in a 200 × 240 box; the head is centred at (100, 105).
const circleRing = (cx: number, cy: number, R: number, n: number, r: number) =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.92, r + ((i * 7) % 5)] as const; });

export const STYLES: Record<StyleId, { name: string; blurb: string; service: string; men?: boolean; layer: Layer }> = {
  waves: {
    name: "Long waves", blurb: "Soft, glossy movement past the shoulders.", service: "cuts",
    layer: {
      back: "M50,104 C36,36 164,36 150,104 C160,128 148,150 158,172 C168,196 150,214 164,232 C140,236 128,220 130,200 C124,186 132,176 126,166 L74,166 C68,176 76,186 70,200 C72,220 60,236 36,232 C50,214 32,196 42,172 C52,150 40,128 50,104Z",
      front: "M54,102 C52,50 146,42 148,100 C140,82 124,70 104,70 C96,84 74,92 54,102Z",
      backStrands: ["M60,110 C54,140 60,170 48,214", "M140,110 C148,140 140,170 152,216"],
      strands: ["M104,72 C116,86 132,92 146,100", "M96,60 C80,66 66,80 58,98"],
    },
  },
  bob: {
    name: "Classic bob", blurb: "Chin-length and razor-neat, with a full fringe.", service: "cuts",
    layer: {
      back: "M48,110 C40,44 160,44 152,110 L156,152 C150,166 128,166 120,158 L80,158 C72,166 50,166 44,152Z",
      front: "M52,96 C52,48 148,48 148,96 L148,100 C126,90 74,90 52,100Z",
      backStrands: ["M54,118 C52,134 52,144 52,154", "M146,118 C148,134 148,144 148,154"],
      strands: ["M80,60 C78,74 78,84 80,94", "M120,60 C122,74 122,84 120,94"],
    },
  },
  pixie: {
    name: "Pixie crop", blurb: "Short, textured and bright-eyed.", service: "cuts",
    layer: {
      back: "M52,104 C46,52 154,52 148,104 L148,116 L52,116Z",
      front: "M54,98 C46,46 150,36 148,92 C140,76 124,70 110,74 C98,60 74,70 54,98Z",
      strands: ["M70,66 C82,60 96,62 104,70", "M112,58 C124,56 138,64 144,78"],
    },
  },
  curls: {
    name: "Big natural curls", blurb: "Defined, bouncy volume with a diffused finish.", service: "treatments",
    layer: {
      cap: false,
      extra: (c, id) => (
        <g>
          {circleRing(100, 96, 62, 22, 20).map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={`url(#hg-${id})`} />)}
          {circleRing(100, 96, 42, 14, 18).map(([x, y, r], i) => <circle key={"b" + i} cx={x} cy={y - 6} r={r} fill={`url(#hg-${id})`} />)}
          <circle cx="100" cy="80" r="48" fill={`url(#hg-${id})`} />
        </g>
      ),
      front: "M58,92 C62,62 82,52 100,56 C118,52 138,62 142,92 C130,80 118,82 110,76 C100,84 86,78 76,84 C70,86 64,88 58,92Z",
      strands: ["M66,74 a6,6 0 1,1 10,4", "M90,62 a6,6 0 1,1 10,4", "M116,64 a6,6 0 1,1 10,4", "M132,78 a6,6 0 1,1 8,6"],
    },
  },
  bun: {
    name: "Sleek top bun", blurb: "Polished and lifted — an evening favourite.", service: "cuts",
    layer: {
      back: "M54,108 C48,52 152,52 146,108 L144,96 C140,72 60,72 56,96Z",
      front: "M54,100 C54,56 146,56 146,100 C132,78 112,70 100,70 C88,70 68,78 54,100Z",
      extra: (c, id) => (
        <g>
          <circle cx="100" cy="36" r="24" fill={`url(#hg-${id})`} />
          <path d="M84,36 C90,22 112,22 116,36 C112,46 92,48 88,40" fill="none" stroke={tone(c, 0.3)} strokeWidth="1.6" />
          <rect x="88" y="52" width="24" height="7" rx="3" fill={tone(c, -0.4)} />
        </g>
      ),
      strands: ["M100,58 C90,66 72,76 60,96", "M100,58 C110,66 128,76 140,96"],
    },
  },
  ponytail: {
    name: "High ponytail", blurb: "Smooth, swinging and gym-to-dinner ready.", service: "cuts",
    layer: {
      back: "M54,108 C48,52 152,52 146,108 L144,96 C140,72 60,72 56,96Z",
      front: "M54,100 C56,56 146,52 146,100 C134,76 112,66 96,70 C80,72 64,82 54,100Z",
      extra: (c, id) => (
        <g>
          <path d="M140,56 C176,50 186,96 172,140 C166,160 176,178 168,196 C158,170 150,150 156,120 C160,96 152,76 140,70Z" fill={`url(#hg-${id})`} />
          <rect x="134" y="54" width="14" height="10" rx="4" fill="#b39762" transform="rotate(-20 141 59)" />
        </g>
      ),
      strands: ["M150,70 C168,90 166,120 160,150"],
    },
  },
  quiff: {
    name: "Pompadour quiff", blurb: "Height at the front, tight and tidy at the sides.", service: "him", men: true,
    layer: {
      back: "M56,108 C52,70 148,70 144,108 L144,98 C140,84 60,84 56,98Z",
      front: "M58,96 C48,44 104,18 152,48 C144,52 136,58 142,76 C126,64 96,66 76,78 C68,84 62,88 58,96Z",
      strands: ["M70,70 C90,46 120,36 146,48", "M80,80 C98,62 120,56 140,66"],
    },
  },
  fade: {
    name: "Curly top, skin fade", blurb: "Texture on top, blended down to the skin.", service: "him", men: true,
    layer: {
      cap: false,
      back: "M56,112 C54,76 146,76 144,112 L144,96 C140,82 60,82 56,96Z",
      extraFront: (c, id) => (
        <g>
          <path d="M54,100 C54,84 60,80 64,80 L64,112 L54,112Z M146,100 C146,84 140,80 136,80 L136,112 L146,112Z" fill={c} opacity="0.25" />
          {Array.from({ length: 16 }, (_, i) => { const x = 63 + (i % 8) * 10.5, y = 50 + Math.floor(i / 8) * 11 + ((i * 3) % 4); return <circle key={i} cx={x} cy={y} r="9" fill={`url(#hg-${id})`} />; })}
        </g>
      ),
      strands: ["M64,58 a5,5 0 1,1 8,3", "M86,54 a5,5 0 1,1 8,3", "M110,56 a5,5 0 1,1 8,3", "M128,60 a5,5 0 1,1 8,3"],
    },
  },
  braids: {
    name: "Twin braids", blurb: "Two neat plaits from a centre part.", service: "cuts",
    layer: {
      back: "M52,108 C46,50 154,50 148,108 L146,120 L54,120Z",
      front: "M54,100 C54,52 98,48 100,64 C102,48 146,52 146,100 C134,82 116,72 100,68 C84,72 66,82 54,100Z",
      extra: (c, id) => (
        <g>
          {[56, 144].map((x0, k) => (
            <g key={k}>
              {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={x0 + (i % 2 ? 4 : -4) * (k ? -1 : 1)} cy={124 + i * 13} rx="9" ry="8" fill={`url(#hg-${id})`} stroke={tone(c, -0.35)} strokeWidth="0.8" />)}
              <rect x={x0 - 5} y={226} width="10" height="6" rx="2" fill="#b76e64" />
            </g>
          ))}
        </g>
      ),
      strands: ["M100,64 C100,76 100,84 100,90"],
    },
  },
  shag: {
    name: "Shag with curtain bangs", blurb: "Choppy layers, face-framing curtain fringe.", service: "cuts",
    layer: {
      back: "M48,104 C38,40 162,40 152,104 C158,128 156,150 162,168 L148,162 L150,182 L134,170 L128,186 L116,168 L84,168 L72,186 L66,170 L50,182 L52,162 L38,168 C44,150 42,128 48,104Z",
      front: "M54,104 C50,52 150,52 146,104 C140,88 126,76 108,74 C104,84 100,90 100,96 C100,90 96,84 92,74 C74,76 60,88 54,104Z",
      strands: ["M92,76 C80,84 66,94 58,104", "M108,76 C120,84 134,94 142,104"],
    },
  },
  lob: {
    name: "Lob with a side part", blurb: "Collarbone length, effortless bend.", service: "highlights",
    layer: {
      back: "M48,108 C40,42 160,42 152,108 C156,130 150,154 158,176 C140,182 126,174 120,166 L80,166 C74,174 60,182 42,176 C50,154 44,130 48,108Z",
      front: "M54,104 C52,50 148,46 148,100 C144,84 126,66 82,70 C72,78 60,90 54,104Z",
      backStrands: ["M54,120 C52,140 52,156 46,172", "M146,120 C148,140 148,156 154,172"],
    },
  },
  buzz: {
    name: "Clean buzz", blurb: "Low-maintenance and sharp.", service: "him", men: true,
    layer: {
      cap: false,
      front: "M53,100 C48,34 152,34 147,100 C132,84 68,84 53,100Z",
      extraFront: (c) => <g>{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={64 + (i % 10) * 8} cy={52 + Math.floor(i / 10) * 7} r="0.9" fill={tone(c, -0.4)} />)}</g>,
    },
  },
};

const FACE: Record<FaceShape, string> = {
  oval: "M100,50 C130,50 146,76 146,108 C146,140 126,162 100,162 C74,162 54,140 54,108 C54,76 70,50 100,50Z",
  round: "M100,52 C134,52 150,78 150,110 C150,144 128,160 100,160 C72,160 50,144 50,110 C50,78 66,52 100,52Z",
  square: "M60,62 C70,52 130,52 140,62 C148,74 148,124 144,140 C138,156 120,162 100,162 C80,162 62,156 56,140 C52,124 52,74 60,62Z",
  heart: "M100,52 C138,50 152,78 148,104 C144,132 122,150 100,164 C78,150 56,132 52,104 C48,78 62,50 100,52Z",
  long: "M100,46 C128,46 142,74 142,110 C142,146 124,170 100,170 C76,170 58,146 58,110 C58,74 72,46 100,46Z",
};

export const SKINS = ["#f6d7c3", "#eac0a2", "#d49a74", "#b07a55", "#8a5a3c", "#5e3b28"];

export function HairLayer({ style, color, id, part }: { style: StyleId; color: string; id: string; part: "back" | "front" }) {
  const L = STYLES[style].layer;
  const d = part === "back" ? L.back : L.front;
  const cap = L.cap !== false && part === "front";
  return (
    <g>
      {part === "back" && L.extra ? L.extra(color, id) : null}
      {d ? <path d={d} fill={`url(#hg-${id})`} /> : null}
      {part === "back" && L.backStrands?.map((s, i) => <path key={i} d={s} fill="none" stroke={tone(color, 0.32)} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />)}
      {cap ? <path d={CAP} fill={`url(#hg-${id})`} /> : null}
      {cap && d ? <path d={d} fill={`url(#hg-${id})`} /> : null}
      {part === "front" && L.extraFront ? L.extraFront(color, id) : null}
      {part === "front" && d ? (
        <>
          <clipPath id={`hc-${id}`}><path d={d} /></clipPath>
          <ellipse cx="88" cy="66" rx="34" ry="10" fill="#fff" opacity="0.18" clipPath={`url(#hc-${id})`} transform="rotate(-14 88 66)" />
        </>
      ) : null}
      {part === "front" && L.strands?.map((s, i) => <path key={i} d={s} fill="none" stroke={tone(color, 0.32)} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />)}
    </g>
  );
}

export function HairDefs({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <linearGradient id={`hg-${id}`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor={tone(color, 0.18)} />
        <stop offset="0.45" stopColor={color} />
        <stop offset="1" stopColor={tone(color, -0.35)} />
      </linearGradient>
    </defs>
  );
}

export default function Caricature({ id, style = "waves", color = "#6b4630", skin = SKINS[1], face = "oval", glasses = false, beard = false, shirt = "#2c2420", mood = "smile", className = "", bald = false }:
  { id: string; bald?: boolean; style?: StyleId; color?: string; skin?: string; face?: FaceShape; glasses?: boolean; beard?: boolean; shirt?: string; mood?: "smile" | "grin" | "calm"; className?: string }) {
  const cheek = tone(skin, -0.06);
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={`Illustration: ${STYLES[style].name}`}>
      <HairDefs id={id} color={color} />
      <defs>
        <radialGradient id={`sk-${id}`} cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor={tone(skin, 0.12)} /><stop offset="1" stopColor={tone(skin, -0.08)} /></radialGradient>
      </defs>
      {!bald && <HairLayer style={style} color={color} id={id} part="back" />}
      {/* shoulders and neck */}
      <path d="M30,240 C34,200 62,186 100,186 C138,186 166,200 170,240Z" fill={shirt} />
      <path d="M86,150 L86,190 C92,198 108,198 114,190 L114,150Z" fill={tone(skin, -0.12)} />
      {/* ears */}
      <ellipse cx="53" cy="112" rx="8" ry="12" fill={cheek} />
      <ellipse cx="147" cy="112" rx="8" ry="12" fill={cheek} />
      {!STYLES[style].men && <><circle cx="52" cy="128" r="3" fill="#d6bd92" /><circle cx="148" cy="128" r="3" fill="#d6bd92" /></>}
      <path d={FACE[face]} fill={`url(#sk-${id})`} />
      {beard && <path d="M60,124 C64,160 84,172 100,172 C116,172 136,160 140,124 C132,138 118,142 100,142 C82,142 68,138 60,124Z" fill={`url(#hg-${id})`} opacity="0.95" />}
      {/* brows */}
      <path d="M70,92 C76,86 86,86 92,90" fill="none" stroke={tone(color, -0.3)} strokeWidth="3" strokeLinecap="round" />
      <path d="M108,90 C114,86 124,86 130,92" fill="none" stroke={tone(color, -0.3)} strokeWidth="3" strokeLinecap="round" />
      {/* eyes — big, caricature-friendly */}
      {[82, 118].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="106" rx="9" ry={mood === "calm" ? 4 : 8} fill="#fff" />
          <circle cx={x + 1} cy="107" r={mood === "calm" ? 3 : 5} fill="#2a1d16" />
          <circle cx={x + 3} cy="104" r="1.6" fill="#fff" />
        </g>
      ))}
      {glasses && <g fill="none" stroke="#1b1613" strokeWidth="2.4"><rect x="68" y="96" width="28" height="22" rx="9" /><rect x="104" y="96" width="28" height="22" rx="9" /><path d="M96,106 L104,106" /></g>}
      {/* nose, cheeks, mouth */}
      <path d="M100,112 C97,122 96,126 101,128" fill="none" stroke={tone(skin, -0.25)} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="72" cy="126" rx="9" ry="5" fill="#e48a80" opacity="0.35" />
      <ellipse cx="128" cy="126" rx="9" ry="5" fill="#e48a80" opacity="0.35" />
      {mood === "grin"
        ? <path d="M84,136 C90,150 110,150 116,136 Z" fill="#7a2d2a" stroke="#5c1f1d" strokeWidth="1" />
        : <path d={mood === "calm" ? "M90,140 C96,143 104,143 110,140" : "M86,136 C92,146 108,146 114,136"} fill="none" stroke="#7a2d2a" strokeWidth="2.6" strokeLinecap="round" />}
      {!bald && <HairLayer style={style} color={color} id={id} part="front" />}
    </svg>
  );
}
