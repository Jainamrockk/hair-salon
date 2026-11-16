import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ivory text-noir pin-spot grid place-items-center p-8 text-center grain relative">
      <div>
        <Link href="/" className="text-3xl"><Logo light /></Link>
        <p className="h-display text-[28vw] md:text-[220px] text-gold-light/90 mt-6">404</p>
        <h1 className="font-display text-4xl md:text-5xl font-light">This page took the day off.</h1>
        <p className="text-noir/60 mt-4">The link may be old, or the page has moved.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3"><Link href="/" className="btn-gold">Home</Link><Link href="/book" className="btn-ghost">Book an appointment</Link><Link href="/services" className="btn-ghost">Services</Link></div>
      </div>
    </main>
  );
}
