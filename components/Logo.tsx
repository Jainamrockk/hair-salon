export default function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-display leading-none ${light ? "text-ivory" : "text-noir"} ${className}`}>
      <span className="text-[1.05em] font-light tracking-[0.02em]">Salon</span>
      <span className="ml-[0.28em] text-[1.05em] italic font-medium relative">
        Ch<span className="relative">é<span className="absolute -top-[0.18em] left-[0.12em] h-[0.12em] w-[0.34em] rotate-[-30deg] rounded-sm bg-gold" /></span>
      </span>
    </span>
  );
}
