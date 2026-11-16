"use client";
import { useEffect, useRef, useState } from "react";

/** Image with a velvet fallback if the photo fails to load (including failures that happen before hydration). */
export default function Img({ src, alt, className = "", label }: { src: string; alt: string; className?: string; label?: string }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setErr(true);
  }, [src]);
  if (err || !src)
    return (
      <div className={`relative grid place-items-center plinth text-gold-light/70 ${className}`} role="img" aria-label={alt}>
        <span className="font-display text-2xl px-6 text-center">{label ?? "Salon Ché"}</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErr(true)} loading="lazy" />;
}
