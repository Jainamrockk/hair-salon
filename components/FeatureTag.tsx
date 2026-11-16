import { featureById, showPriceTags } from "@/lib/features";

/** Small "Add-on · $X" tag that marks every feature beyond the base website. Hide with NEXT_PUBLIC_SHOW_PRICE_TAGS=false. */
export default function FeatureTag({ id, className = "" }: { id: string; className?: string }) {
  const f = featureById(id);
  if (!f || !showPriceTags()) return null;
  return (
    <a href={`/features#${f.id}`} title={`${f.name} — add-on feature`} className={`tag-price hover:bg-gold/25 ${className}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
      Add-on · ${f.price}
    </a>
  );
}
