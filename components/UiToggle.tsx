"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** Switches the whole site between the premium look (off) and the original design-artifact UI (on). */
export default function UiToggle({ initial, compact = false, className = "" }: { initial: "premium" | "design"; compact?: boolean; className?: string }) {
  const router = useRouter();
  const [on, setOn] = useState(initial === "design");
  const [, start] = useTransition();
  useEffect(() => setOn(initial === "design"), [initial]);
  const flip = () => {
    const next = !on;
    setOn(next);
    document.cookie = `che_ui=${next ? "design" : "premium"}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.classList.toggle("ui-design", next);
    start(() => router.refresh());
  };
  return (
    <button type="button" role="switch" aria-checked={on} onClick={flip} title={on ? "Design UI is on — switch to the premium site" : "Switch to the Design UI"}
      className={`inline-flex items-center gap-2 text-[12px] ${className}`}>
      {!compact && <span className="text-noir/70 whitespace-nowrap">Design UI</span>}
      <span className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${on ? "bg-gold" : "bg-noir/20"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#fff] shadow transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
      <span className="sr-only">{on ? "On" : "Off"}</span>
    </button>
  );
}
