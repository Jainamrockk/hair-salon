import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SESSION_SECRET || "salon-che-dev-secret-change-me";
const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("base64url");
export const seal = (v: string) => `${v}.${sign(v)}`;
export function unseal(token?: string) {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const v = token.slice(0, i), s = token.slice(i + 1);
  const a = Buffer.from(s), b = Buffer.from(sign(v));
  return a.length === b.length && timingSafeEqual(a, b) ? v : null;
}
const opts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 60 };

export const ownerPassword = () => process.env.OWNER_PASSWORD || "salonche";
export async function isOwner() { return unseal((await cookies()).get("sc_owner")?.value) === "owner"; }
export async function setOwner(on: boolean) {
  const c = await cookies();
  on ? c.set("sc_owner", seal("owner"), opts) : c.delete("sc_owner");
}
export async function clientId(): Promise<number | null> {
  const v = unseal((await cookies()).get("sc_client")?.value);
  return v ? Number(v) : null;
}
export async function setClient(id: number | null) {
  const c = await cookies();
  id ? c.set("sc_client", seal(String(id)), opts) : c.delete("sc_client");
}
