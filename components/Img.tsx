"use client";
import { useState } from "react";

/** Image with an elegant gradient fallback if the photo fails to load. */
export default function Img({ src, alt, className = "", label }: { src: string; alt: string; className?: string; label?: string }) {
  const [err, setErr] = useState(false);
  if (err || !src)
    return (
      <div className={`relative grid place-items-center bg-gradient-to-br from-cocoa via-[#5b463a] to-gold/70 text-ivory/70 ${className}`} role="img" aria-label={alt}>
        <span className="font-display italic text-2xl px-6 text-center">{label ?? "Salon Ché"}</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErr(true)} loading="lazy" />;
}
