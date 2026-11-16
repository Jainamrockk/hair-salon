import "server-only";
import { cookies } from "next/headers";

export type Ui = "premium" | "design";
/** Which look the visitor chose with the header toggle: the premium site, or the original design artifact. */
export async function getUi(): Promise<Ui> {
  return (await cookies()).get("che_ui")?.value === "design" ? "design" : "premium";
}
