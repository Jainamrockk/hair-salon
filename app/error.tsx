"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8 text-center">
      <div>
        <p className="eyebrow-gold">Something went wrong</p>
        <h1 className="h1 mt-4">We lost the <em>connection.</em></h1>
        <p className="lead mt-4">Check your signal and try again. Your booking hasn&apos;t been charged.</p>
        <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn-dark">Try again</button><a href="sms:+12084665500" className="btn-ghost">Text Lee</a><Link href="/" className="btn-ghost">Home</Link></div>
      </div>
    </main>
  );
}
