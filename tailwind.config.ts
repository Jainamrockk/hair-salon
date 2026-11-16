import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F1EA",
        cream: "#EFE7DC",
        sand: "#E2D6C6",
        stone: "#A79A89",
        taupe: "#6E6357",
        cocoa: "#3B302A",
        noir: "#15110F",
        gold: { DEFAULT: "#B08D57", light: "#D4B98A", deep: "#8A6A3B" },
        rose: "#B76E64",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em" },
      boxShadow: { soft: "0 30px 80px -30px rgba(21,17,15,.35)" },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "none" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: { rise: "rise .9s cubic-bezier(.2,.7,.2,1) both", marquee: "marquee 40s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
