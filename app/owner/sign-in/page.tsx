"use client";
import { useActionState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ownerSignIn } from "@/app/actions";

export default function OwnerSignIn() {
  const [state, action, pending] = useActionState(ownerSignIn, null as null | { error: string });
  return (
    <main className="theme-pearl min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-noir text-ivory p-14 flex-col justify-between grain relative">
        <Link href="/" className="text-3xl"><Logo light /></Link>
        <div><p className="eyebrow-gold">Owner app</p><h1 className="h-display text-8xl mt-4">Your day, <em className="text-gold-light">at a glance.</em></h1></div>
        <p className="text-ivory/50 text-sm">Appointments, clients, money and the website — in one place.</p>
      </div>
      <div className="grid place-items-center p-8">
        <form action={action} className="w-full max-w-sm">
          <Link href="/" className="text-3xl lg:hidden"><Logo /></Link>
          <h2 className="font-display text-5xl mt-8">Welcome back, Lee.</h2>
          <p className="text-taupe mt-2">Sign in to manage Salon Ché.</p>
          <label className="label mt-8" htmlFor="pw">Password</label>
          <input id="pw" name="password" type="password" className="input" autoComplete="current-password" required />
          {state?.error && <p role="alert" className="text-danger mt-3 text-sm">{state.error}</p>}
          <button className="btn-dark w-full mt-6" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
          <p className="text-xs text-stone mt-4">Demo password: <code>salonche</code> (set <code>OWNER_PASSWORD</code> in production).</p>
        </form>
      </div>
    </main>
  );
}
