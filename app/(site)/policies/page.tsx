import PageHero from "@/components/PageHero";
import { getRules } from "@/lib/data";
import { SALON } from "@/lib/content";

export const metadata = { title: "Policies" };
export default async function Policies() {
  const r = await getRules();
  const sections: [string, string, string[]][] = [
    ["booking", "Booking & cancelling", [
      `Color, and any visit of ${r.depositMinMinutes} minutes or longer, takes a $${r.depositCents / 100} deposit when you book online. It comes off your total.`,
      `Change or cancel for free until ${r.cancelHours} hours before your visit, from your account or the link in your text.`,
      `Inside ${r.cancelHours} hours, or if you miss the visit, the deposit covers the time Lee held for you.`,
      `Running late? Text ${SALON.phone}. Lee will keep your time if the day allows.`,
      "After-hours visits are by request. Lee confirms each one by text.",
      "Gift cards never expire and work for any service or product.",
      "First color with Lee? Some color lines ask for a 5-minute patch test 48 hours before. Lee will text you to arrange it.",
    ]],
    ["privacy", "Privacy", [
      "We keep your name, mobile number, email, visits and any notes, to book and look after your visits.",
      "The live mirror and colour try-on run on your device; those photos never leave it. The photo-real AI try-on sends your photo to Google's Gemini AI only to create your preview — you agree to this first, and Salon Ché doesn't store it. Saved looks keep only the style you chose.",
      "Texts come from the salon's number. Reply STOP to any text to stop them.",
      "Payments are handled by Stripe. Salon Ché never sees your full card number.",
      "We don't sell your information or share it for advertising.",
      "Download or delete your data any time from Settings in your account.",
    ]],
    ["accessibility", "Accessibility", [
      "The salon entrance is at street level, with free parking out front.",
      "This site is designed to meet WCAG 2.2 level AA, so it works with screen readers, keyboards and zoom.",
      `Need help booking, or something to make your visit easier? Call or text ${SALON.phone}.`,
    ]],
  ];
  return (
    <>
      <PageHero eyebrow="Policies" title={<>The fine print, <em>in plain words.</em></>} lead="How booking and deposits work, what we keep about you, and how we make the salon and this site easy to use." />
      <div className="container-x pb-28 grid lg:grid-cols-12 gap-12">
        <nav className="lg:col-span-3 lg:sticky lg:top-28 self-start space-y-2">{sections.map(([id, t]) => <a key={id} href={`#${id}`} className="block border-b border-sand py-2 hover:text-gold-deep">{t}</a>)}</nav>
        <div className="lg:col-span-9 space-y-16">
          {sections.map(([id, t, items]) => (
            <section key={id} id={id} className="scroll-mt-28">
              <h2 className="font-display text-5xl font-light mb-6">{t}</h2>
              <ul className="space-y-4">{items.map((x) => <li key={x} className="flex gap-4 text-lg text-cocoa/90 leading-relaxed"><span className="text-gold mt-1">✦</span>{x}</li>)}</ul>
            </section>
          ))}
          <p className="text-sm text-taupe">Last updated November 2026. Questions? Email <a href={`mailto:${SALON.email}`} className="underline">{SALON.email}</a>.</p>
        </div>
      </div>
    </>
  );
}
