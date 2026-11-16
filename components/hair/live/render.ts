/**
 * Realistic strand-based hair, anchored to a tracked face.
 *
 * Coordinates are "head units": the origin is the centre of the hairline (MediaPipe landmark 10), x runs to the
 * viewer's right, y runs down, and 1 unit = half the face width. The chin sits near y = 2.7, shoulders near 3.6.
 * Each style is generated as a set of guide curves; every guide is drawn as a soft body stroke plus many fine
 * strands with per-strand colour, so the hair reads as hair rather than a flat shape.
 */

export type Pt = { x: number; y: number };
export type LiveStyleId =
  | "long-layers" | "beach-waves" | "lob" | "bob-fringe" | "pixie" | "curls"
  | "curtain-shag" | "sleek-bun" | "ponytail" | "quiff" | "french-crop" | "buzz";

type Fringe = "none" | "blunt" | "curtain" | "side" | "wispy";
type Spec = {
  name: string; who: "her" | "him" | "all"; service: string; blurb: string;
  part: number; volume: number; length: number; backLength: number; flare: number;
  wave: number; waveFreq: number; curl: number; fringe: Fringe; fringeY: number;
  guides: number; strands: number; short?: boolean; kind?: "down" | "bun" | "pony" | "quiff" | "crop" | "buzz";
};

export const LIVE_STYLES: Record<LiveStyleId, Spec> = {
  "long-layers": { name: "Long layers", who: "her", service: "cuts", blurb: "Past the shoulders with soft face-framing layers.", part: 0.18, volume: 1.08, length: 4.4, backLength: 4.6, flare: 0.35, wave: 0.04, waveFreq: 2, curl: 0, fringe: "none", fringeY: 0, guides: 46, strands: 9 },
  "beach-waves": { name: "Beach waves", who: "her", service: "cuts", blurb: "Loose, lived-in bends with movement.", part: -0.22, volume: 1.14, length: 4.0, backLength: 4.2, flare: 0.55, wave: 0.18, waveFreq: 3.2, curl: 0, fringe: "none", fringeY: 0, guides: 46, strands: 9 },
  lob: { name: "Collarbone lob", who: "her", service: "highlights", blurb: "A long bob that grazes the collarbone.", part: 0.3, volume: 1.1, length: 3.25, backLength: 3.3, flare: 0.3, wave: 0.07, waveFreq: 2.4, curl: 0, fringe: "none", fringeY: 0, guides: 42, strands: 9 },
  "bob-fringe": { name: "Blunt bob & fringe", who: "her", service: "cuts", blurb: "Chin-length and razor-neat with a full fringe.", part: 0, volume: 1.12, length: 2.55, backLength: 2.6, flare: 0.12, wave: 0, waveFreq: 0, curl: 0, fringe: "blunt", fringeY: 0.42, guides: 44, strands: 9 },
  pixie: { name: "Textured pixie", who: "her", service: "cuts", blurb: "Short, soft and bright-eyed.", part: 0.35, volume: 1.06, length: 0.9, backLength: 1.4, flare: 0.05, wave: 0.05, waveFreq: 4, curl: 0, fringe: "side", fringeY: 0.3, guides: 40, strands: 8, short: true },
  curls: { name: "Big natural curls", who: "all", service: "treatments", blurb: "Defined, bouncy volume, diffused.", part: 0, volume: 1.28, length: 3.1, backLength: 3.3, flare: 0.75, wave: 0, waveFreq: 0, curl: 0.075, fringe: "none", fringeY: 0, guides: 54, strands: 7 },
  "curtain-shag": { name: "Shag with curtain bangs", who: "her", service: "cuts", blurb: "Choppy layers and a centre-parted curtain fringe.", part: 0, volume: 1.16, length: 3.4, backLength: 3.6, flare: 0.6, wave: 0.1, waveFreq: 3, curl: 0, fringe: "curtain", fringeY: 0.7, guides: 46, strands: 9 },
  "sleek-bun": { name: "Sleek top bun", who: "her", service: "cuts", blurb: "Polished, lifted and evening-ready.", part: 0, volume: 1.03, length: 0, backLength: 0, flare: 0, wave: 0, waveFreq: 0, curl: 0, fringe: "none", fringeY: 0, guides: 40, strands: 8, kind: "bun" },
  ponytail: { name: "High ponytail", who: "her", service: "cuts", blurb: "Smooth, swinging and snatched.", part: 0, volume: 1.04, length: 0, backLength: 0, flare: 0, wave: 0.06, waveFreq: 2, curl: 0, fringe: "none", fringeY: 0, guides: 40, strands: 8, kind: "pony" },
  quiff: { name: "Textured quiff", who: "him", service: "him", blurb: "Height at the front, tight at the sides.", part: 0, volume: 1.05, length: 0, backLength: 0, flare: 0, wave: 0, waveFreq: 0, curl: 0, fringe: "none", fringeY: 0, guides: 40, strands: 8, kind: "quiff" },
  "french-crop": { name: "French crop & fade", who: "him", service: "him", blurb: "A short textured fringe over a skin fade.", part: 0, volume: 1.03, length: 0, backLength: 0, flare: 0, wave: 0, waveFreq: 0, curl: 0, fringe: "none", fringeY: 0, guides: 40, strands: 8, kind: "crop" },
  buzz: { name: "Clean buzz", who: "him", service: "him", blurb: "Low-maintenance and sharp.", part: 0, volume: 1.01, length: 0, backLength: 0, flare: 0, wave: 0, waveFreq: 0, curl: 0, fringe: "none", fringeY: 0, guides: 0, strands: 0, kind: "buzz" },
};
export const LIVE_IDS = Object.keys(LIVE_STYLES) as LiveStyleId[];

// ── colour helpers ─────────────────────────────────────────────────────────────
const hex2rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function palette(hex: string) {
  const base = hex2rgb(hex);
  const black = [12, 8, 6], white = [255, 246, 228];
  return { dark: mix(base, black, 0.55), mid: mix(base, black, 0.12), light: mix(base, white, 0.22), shine: mix(base, white, 0.5) };
}

// deterministic pseudo-random so strands don't flicker between frames
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── guide generation ───────────────────────────────────────────────────────────
const CY = 0.78, RX = 1.12, RY = 1.6; // scalp ellipse in head units
const scalp = (a: number, v: number): Pt => ({ x: RX * v * Math.sin(a), y: CY - RY * v * Math.cos(a) });

type Guide = { pts: Pt[]; w: number; layer: "back" | "front"; fall: number /* index from which the strand hangs free */ };

function sample(ctrl: Pt[], n = 22): Pt[] {
  // Catmull-Rom through control points
  const out: Pt[] = [];
  const P = [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    for (let k = 0; k < n / (ctrl.length - 1); k++) {
      const t = k / (n / (ctrl.length - 1));
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

const cache = new Map<string, Guide[]>();
export function guidesFor(id: LiveStyleId): Guide[] {
  if (cache.has(id)) return cache.get(id)!;
  const S = LIVE_STYLES[id], r = rng(id.length * 9973 + S.guides), G: Guide[] = [];
  const v = S.volume;
  const top = scalp(0, v);
  const partX = S.part;

  const hang = (start: Pt[], side: number, len: number, flare: number, curl: number, wave: number, freq: number, ph: number) => {
    const last = start[start.length - 1];
    const ctrl = [...start];
    const steps = 6;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const y = last.y + (len - last.y) * t;
      let x = last.x + side * flare * t * t;
      x += wave * Math.sin(freq * y + ph);
      ctrl.push({ x, y });
    }
    let pts = sample(ctrl, 28);
    if (curl > 0) pts = pts.map((p, i) => { const t = i / pts.length; if (t < 0.25) return p; const k = (t - 0.25) * 44 + ph; return { x: p.x + curl * Math.sin(k), y: p.y + curl * 0.45 * Math.cos(k) }; });
    return { pts, fall: Math.floor((start.length / ctrl.length) * pts.length) };
  };

  if (!S.kind || S.kind === "down") {
    // scalp-to-side guides that fall down past the face
    for (let i = 0; i < S.guides; i++) {
      const s = -1 + (2 * i) / (S.guides - 1);
      const side = s < partX ? -1 : 1;
      const rel = side < 0 ? (s - partX) / (1 + partX) : (s - partX) / (1 - partX); // -1..1 from part
      const a = rel * 1.95;
      const root = { x: partX + (r() - 0.5) * 0.06, y: top.y + 0.05 };
      const mid = scalp(a * 0.55, v * 1.02);
      const edge = scalp(a, v);
      const short = S.short;
      const len = short ? Math.max(edge.y + 0.15, S.length * (0.85 + r() * 0.3)) : S.length * (0.9 + r() * 0.18) - (1 - Math.abs(rel)) * 0.25;
      const { pts, fall } = Math.abs(a) < 0.9 && !short
        ? { pts: sample([root, mid, edge, { x: edge.x * 1.02, y: edge.y + 0.2 }], 16), fall: 99 }
        : hang([root, mid, edge], side, len, S.flare * (0.6 + r() * 0.6), S.curl, S.wave * (0.6 + r() * 0.8), S.waveFreq, r() * 6);
      G.push({ pts, w: 0.2 + r() * 0.1, layer: "back", fall });
    }
    // hair that falls behind the neck and over the shoulders
    if (S.backLength > 2.8) for (let i = 0; i < 18; i++) {
      const side = i < 9 ? -1 : 1, k = (i % 9) / 8;
      const x0 = side * (0.75 + k * 0.45), y0 = 1.6 + k * 0.3;
      const { pts, fall } = hang([{ x: x0 * 0.9, y: y0 - 0.6 }, { x: x0, y: y0 }], side, S.backLength * (0.92 + r() * 0.15), S.flare * 0.8, S.curl, S.wave, S.waveFreq, r() * 6);
      G.push({ pts, w: 0.24, layer: "back", fall });
    }
  }

  if (S.kind === "bun" || S.kind === "pony") {
    const tie: Pt = S.kind === "bun" ? { x: 0, y: top.y - 0.15 } : { x: 0.15, y: top.y + 0.05 };
    for (let i = 0; i < S.guides; i++) {
      const s = -1 + (2 * i) / (S.guides - 1), a = s * 1.85;
      const edge = scalp(a, v * 0.99), mid = scalp(a * 0.5, v);
      G.push({ pts: sample([edge, mid, tie], 14), w: 0.16, layer: "back", fall: 99 });
    }
    if (S.kind === "bun") {
      for (let i = 0; i < 26; i++) {
        const pts: Pt[] = []; const r0 = 0.12 + r() * 0.3, ph = r() * 6;
        for (let k = 0; k <= 22; k++) { const t = ph + (k / 22) * Math.PI * 2.2; pts.push({ x: tie.x + Math.cos(t) * r0 * 1.15, y: tie.y - 0.32 + Math.sin(t) * r0 }); }
        G.push({ pts, w: 0.14, layer: "back", fall: 99 });
      }
    } else {
      for (let i = 0; i < 22; i++) {
        const { pts, fall } = hang([tie, { x: tie.x + 0.55 + r() * 0.2, y: tie.y + 0.15 }], 1, 3.2 + r() * 0.6, 0.35, 0, 0.12, 2.4, r() * 6);
        G.push({ pts, w: 0.18, layer: "back", fall: Math.max(2, fall - 4) });
      }
    }
  }

  if (S.kind === "quiff" || S.kind === "crop") {
    // short sides (the fade is drawn as a scalp tint), textured top
    for (let i = 0; i < 30; i++) {
      const s = -1 + (2 * i) / 29, a = s * 1.7;
      const e = scalp(a, v * 0.98);
      G.push({ pts: sample([scalp(a * 0.6, v * 0.99), e, { x: e.x * 1.01, y: e.y + 0.18 }], 8), w: 0.08, layer: "back", fall: 99 });
    }
    for (let i = 0; i < 34; i++) {
      const s = -0.85 + (1.7 * i) / 33;
      const base = { x: s * 0.95, y: -0.55 + Math.abs(s) * 0.15 };
      const pts = S.kind === "quiff"
        ? sample([{ x: s * 0.82, y: 0.05 + s * s * 0.25 }, { x: s * 0.8 + 0.03, y: -0.55 - (1 - s * s) * 0.2 }, { x: s * 0.62 + 0.12, y: -1.05 - (1 - s * s) * 0.38 + (r() - 0.5) * 0.08 }, { x: s * 0.35 + 0.2 + (r() - 0.5) * 0.1, y: -1.0 - (1 - s * s) * 0.2 }], 16)
        : sample([{ x: base.x * 0.8, y: -0.9 }, base, { x: base.x * 1.02 + (r() - 0.5) * 0.08, y: 0.12 + r() * 0.08 }], 12);
      G.push({ pts, w: 0.14, layer: "front", fall: 99 });
    }
  }

  // the scalp itself: strands combed from the part (or the tie) down to the hairline, so no scalp or own hair peeks through
  if (S.kind !== "buzz") {
    const n = 40;
    const anchor: Pt = S.kind === "bun" ? { x: 0, y: top.y - 0.1 } : S.kind === "pony" ? { x: 0.15, y: top.y + 0.05 } : { x: partX, y: top.y + 0.08 };
    for (let i = 0; i < n; i++) {
      const s2 = -1 + (2 * i) / (n - 1);
      const hl = { x: s2 * 1.04, y: 0.04 + 0.42 * s2 * s2 + (r() - 0.5) * 0.03 };
      const root = { x: anchor.x + (r() - 0.5) * 0.08, y: anchor.y };
      const mid = { x: (root.x + hl.x) / 2 + (hl.x - root.x) * 0.15, y: Math.min(root.y, hl.y) + (hl.y - root.y) * 0.35 - 0.18 * v };
      G.unshift({ pts: sample([root, mid, hl], 14), w: 0.2, layer: "back", fall: 99 });
    }
  }

  // fringes sit in front of the forehead
  if (S.fringe !== "none") {
    const n = S.fringe === "wispy" ? 18 : 30;
    for (let i = 0; i < n; i++) {
      const s = -1 + (2 * i) / (n - 1);
      let ctrl: Pt[];
      if (S.fringe === "blunt") ctrl = [{ x: s * 0.4 + partX, y: -0.75 }, { x: s * 0.85, y: -0.2 }, { x: s * 0.92, y: S.fringeY + (r() - 0.5) * 0.04 }];
      else if (S.fringe === "curtain") { const side = s < 0 ? -1 : 1; ctrl = [{ x: side * 0.05, y: -0.7 }, { x: side * (0.25 + Math.abs(s) * 0.25), y: -0.1 }, { x: side * (0.55 + Math.abs(s) * 0.45), y: S.fringeY + Math.abs(s) * 0.5 }]; }
      else ctrl = [{ x: partX + s * 0.1, y: -0.75 }, { x: partX - 0.3 + s * 0.35, y: -0.25 }, { x: -0.75 + s * 0.4, y: S.fringeY + (s + 1) * 0.12 }];
      G.push({ pts: sample(ctrl, 14), w: 0.12, layer: "front", fall: 2 });
    }
  }
  cache.set(id, G);
  return G;
}

// ── face geometry from MediaPipe landmarks ─────────────────────────────────────
export type Head = { origin: Pt; angle: number; unit: number; oval: Pt[] };
let OVAL_ORDER: number[] | null = null;
export function setOvalConnections(conns: { start: number; end: number }[]) {
  const next = new Map(conns.map((c) => [c.start, c.end]));
  const order = [conns[0].start];
  for (let i = 0; i < conns.length; i++) { const n = next.get(order[order.length - 1]); if (n === undefined || n === order[0]) break; order.push(n); }
  OVAL_ORDER = order;
}
export function headFrom(lm: { x: number; y: number }[], W: number, H: number, mirror: boolean): Head {
  const P = (i: number) => ({ x: (mirror ? 1 - lm[i].x : lm[i].x) * W, y: lm[i].y * H });
  const l = P(234), r = P(454), top = P(10);
  const leftPt = mirror ? r : l, rightPt = mirror ? l : r;
  const angle = Math.atan2(rightPt.y - leftPt.y, rightPt.x - leftPt.x);
  const unit = Math.hypot(rightPt.x - leftPt.x, rightPt.y - leftPt.y) / 2;
  const oval = (OVAL_ORDER ?? []).map(P);
  return { origin: top, angle, unit, oval };
}

// ── drawing ────────────────────────────────────────────────────────────────────
export type Look = { style: LiveStyleId; color: string; ends?: string | null; size: number; lift: number; width: number; density: number };
type Layers = { back: HTMLCanvasElement; front: HTMLCanvasElement };
let layers: Layers | null = null;
function getLayers(W: number, H: number): Layers {
  if (!layers) layers = { back: document.createElement("canvas"), front: document.createElement("canvas") };
  for (const c of [layers.back, layers.front]) if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  return layers;
}

function strokeGuide(ctx: CanvasRenderingContext2D, g: Guide, pal: ReturnType<typeof palette>, endsPal: ReturnType<typeof palette> | null, t: number, sway: Pt, density: number, seed: number, u: number) {
  const R = rng(seed);
  const n = g.pts.length;
  const moved = g.pts.map((p, i) => {
    if (i < g.fall) return p;
    const k = (i - g.fall) / Math.max(1, n - g.fall);
    return { x: p.x + (Math.sin(t * 1.3 + seed) * 0.03 + sway.x) * k * k, y: p.y + sway.y * k * k * 0.3 };
  });
  const path = (off: number, taper: boolean) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = moved[i], q = moved[Math.min(n - 1, i + 1)], o = moved[Math.max(0, i - 1)];
      const dx = q.x - o.x, dy = q.y - o.y, L = Math.hypot(dx, dy) || 1;
      const f = taper ? 1 - (i / n) * 0.7 : 1;
      const x = p.x + (-dy / L) * off * f, y = p.y + (dx / L) * off * f;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
  };
  // body
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  const grad = ctx.createLinearGradient(moved[0].x, moved[0].y, moved[n - 1].x, moved[n - 1].y);
  grad.addColorStop(0, rgba(pal.dark, 1));
  grad.addColorStop(0.4, rgba(pal.dark, 0.95));
  grad.addColorStop(1, rgba(endsPal ? endsPal.dark : pal.dark, 0.7));
  ctx.strokeStyle = grad; ctx.lineWidth = g.w * 0.8; path(0, true); ctx.stroke();
  // strands
  const count = Math.round(16 * density);
  for (let s = 0; s < count; s++) {
    const pick = R();
    const c = pick < 0.35 ? pal.dark : pick < 0.75 ? pal.mid : pick < 0.93 ? pal.light : pal.shine;
    const ce = endsPal ? (pick < 0.35 ? endsPal.mid : pick < 0.75 ? endsPal.light : endsPal.shine) : c;
    const sg = ctx.createLinearGradient(moved[0].x, moved[0].y, moved[n - 1].x, moved[n - 1].y);
    sg.addColorStop(0, rgba(pal.dark, 0.95)); sg.addColorStop(0.25, rgba(c, 0.85)); sg.addColorStop(0.85, rgba(ce, 0.7)); sg.addColorStop(1, rgba(ce, 0));
    ctx.strokeStyle = sg;
    ctx.lineWidth = (0.5 + R() * 1.1) / u;
    path((R() - 0.5) * g.w * 1.35, true); ctx.stroke();
  }
}

/** Draws one hairstyle onto ctx (which already shows the camera frame). */
export function drawHair(ctx: CanvasRenderingContext2D, head: Head, look: Look, t: number, sway: Pt = { x: 0, y: 0 }) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const S = LIVE_STYLES[look.style];
  const pal = palette(look.color), endsPal = look.ends ? palette(look.ends) : null;
  const { back, front } = getLayers(W, H);
  const u = head.unit * look.size;
  for (const [c, layer] of [[back, "back"], [front, "front"]] as const) {
    const x = c.getContext("2d")!;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    x.save();
    x.translate(head.origin.x, head.origin.y - look.lift * head.unit);
    x.rotate(head.angle);
    x.scale(u * look.width, u);
    if (layer === "back" && S.kind === "buzz") {
      // buzz: a fine stubble cap
      const R = rng(7);
      x.fillStyle = rgba(pal.dark, 0.55);
      x.save(); x.beginPath(); x.rect(-2, -3, 4, 3.75); x.clip(); x.beginPath(); x.ellipse(0, CY, RX * 1.01, RY * 1.01, 0, 0, Math.PI * 2); x.fill(); x.restore();
      for (let i = 0; i < 1400; i++) { const a = (R() - 0.5) * 3.4, rr = 0.6 + R() * 0.42; const p = { x: RX * rr * Math.sin(a), y: CY - RY * rr * Math.cos(a) }; x.fillStyle = rgba(R() < 0.7 ? pal.dark : pal.mid, 0.6); x.fillRect(p.x, p.y, 1.4 / u, 1.4 / u); }
    }
    if (layer === "back" && (S.kind === "quiff" || S.kind === "crop")) {
      // skin fade: dense at the top, fading out over the ears
      const g = x.createLinearGradient(0, -0.4, 0, 1.6);
      g.addColorStop(0, rgba(pal.dark, 0.85)); g.addColorStop(0.55, rgba(pal.dark, 0.45)); g.addColorStop(1, rgba(pal.dark, 0));
      x.save(); x.beginPath(); x.rect(-2, -3, 4, 3.9); x.clip(); x.fillStyle = g; x.beginPath(); x.ellipse(0, CY, RX * 0.99, RY * 0.98, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    guidesFor(look.style).forEach((g, i) => { if (g.layer === layer) strokeGuide(x, g, pal, endsPal, t, sway, look.density, i * 31 + 7, u); });
    x.restore();
    // sheen on the crown, darker roots — confined to the hair pixels
    x.globalCompositeOperation = "source-atop";
    const cx = head.origin.x - head.unit * 0.35, cy = head.origin.y - head.unit * 0.7;
    const sh = x.createRadialGradient(cx, cy, 0, cx, cy, head.unit * 1.4);
    sh.addColorStop(0, "rgba(255,240,215,0.16)"); sh.addColorStop(1, "rgba(255,240,215,0)");
    x.fillStyle = sh; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "source-over";
  }
  // tuck the back layer behind the face: erase the face oval from it
  if (head.oval.length > 8) {
    const x = back.getContext("2d")!;
    x.globalCompositeOperation = "destination-out";
    // shrink the oval a touch towards its centre so hair can frame the cheeks, then feather the edge
    const cx = head.oval.reduce((a, p) => a + p.x, 0) / head.oval.length, cy = head.oval.reduce((a, p) => a + p.y, 0) / head.oval.length;
    const pts = head.oval.map((p) => ({ x: cx + (p.x - cx) * 0.97, y: cy + (p.y - cy) * 0.99 }));
    x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y))); x.closePath();
    x.fillStyle = "#000"; x.fill();
    x.lineJoin = "round"; x.strokeStyle = "rgba(0,0,0,0.5)"; x.lineWidth = Math.max(2, head.unit * 0.06); x.stroke();
    x.globalCompositeOperation = "source-over";
  }
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = head.unit * 0.12; ctx.shadowOffsetY = head.unit * 0.04;
  ctx.filter = "blur(0.6px)";
  ctx.drawImage(back, 0, 0);
  ctx.restore();
  ctx.save(); ctx.filter = "blur(0.5px)"; ctx.drawImage(front, 0, 0); ctx.restore();
}

/** Paints over the person's own hair (from the hair segmenter) so a shorter style isn't fighting it. */
export function hideOwnHair(ctx: CanvasRenderingContext2D, mask: Float32Array, mw: number, mh: number, mirror: boolean) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const c = document.createElement("canvas"); c.width = mw; c.height = mh;
  const m = c.getContext("2d")!;
  const img = m.createImageData(mw, mh);
  // background tone from the top corners of the frame
  const sample = ctx.getImageData(0, 0, W, Math.max(1, Math.round(H * 0.08))).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < sample.length; i += 16) { r += sample[i]; g += sample[i + 1]; b += sample[i + 2]; n++; }
  r /= n; g /= n; b /= n;
  for (let i = 0; i < mw * mh; i++) { const a = Math.min(1, Math.max(0, (mask[i] - 0.35) * 2.2)); const p = i * 4; img.data[p] = r; img.data[p + 1] = g; img.data[p + 2] = b; img.data[p + 3] = a * 235; }
  m.putImageData(img, 0, 0);
  ctx.save();
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.filter = "blur(10px)"; ctx.drawImage(c, 0, 0, W, H); ctx.filter = "none";
  ctx.restore();
}

/** Recolours the person's own hair, keeping its light and texture. */
export function recolourOwnHair(ctx: CanvasRenderingContext2D, mask: Float32Array, mw: number, mh: number, mirror: boolean, hex: string, strength: number) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const frame = ctx.getImageData(0, 0, W, H), d = frame.data;
  const [tr, tg, tb] = hex2rgb(hex);
  const lt = 0.3 * tr + 0.59 * tg + 0.11 * tb;
  for (let y = 0; y < H; y++) {
    const my = Math.min(mh - 1, Math.floor((y / H) * mh));
    for (let x = 0; x < W; x++) {
      let mx = Math.floor((x / W) * mw); if (mirror) mx = mw - 1 - mx;
      const a = Math.min(1, Math.max(0, (mask[my * mw + mx] - 0.3) * 1.8)) * strength;
      if (a <= 0.01) continue;
      const p = (y * W + x) * 4, L = 0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2];
      const L2 = L + (lt - L) * 0.55, dl = L2 - lt;
      d[p] += (Math.max(0, Math.min(255, tr + dl)) - d[p]) * a;
      d[p + 1] += (Math.max(0, Math.min(255, tg + dl)) - d[p + 1]) * a;
      d[p + 2] += (Math.max(0, Math.min(255, tb + dl)) - d[p + 2]) * a;
    }
  }
  ctx.putImageData(frame, 0, 0);
}
