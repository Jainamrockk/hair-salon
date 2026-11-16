import type { Config } from "tailwindcss";

// Every colour is a role backed by a CSS variable (see globals.css), so `.theme-pearl` can remap a whole
// section from midnight velvet to the pearl gallery wall — the same system as the Maison Aurelle site.
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: v("ground"), // page ground
        cream: v("raised"), // raised velvet / panels
        surface: v("surface"), // cards and inputs
        white: v("surface"),
        sand: v("line"), // hairlines and borders
        stone: v("smoke"), // tertiary text
        taupe: v("ash"), // secondary text
        cocoa: v("body"), // body text
        noir: v("ink"), // headings / primary text
        gold: { DEFAULT: v("gold"), light: v("gold-light"), deep: v("gold-deep") },
        rose: v("rose"),
        danger: v("danger"),
      },
      fontFamily: {
        display: ["Italiana", "Didot", '"Bodoni 72"', "serif"],
        sans: ["Jost", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.02em" },
      boxShadow: { soft: "0 40px 120px rgb(5 4 3 / 0.55)" },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)", silk: "cubic-bezier(0.65, 0, 0.35, 1)" },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "none" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        twinkle: { "0%,100%": { opacity: "0", transform: "scale(.3) rotate(0deg)" }, "50%": { opacity: "1", transform: "scale(1) rotate(45deg)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: { rise: "rise 1.2s cubic-bezier(.22,1,.36,1) both", marquee: "marquee 60s linear infinite", float: "float 6s ease-in-out infinite" },
    },
  },
  plugins: [],
} satisfies Config;
