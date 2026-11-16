import { OwnerHeader } from "@/components/owner/ui";
import NewAppointment from "@/components/owner/NewAppointment";
import { getServices } from "@/lib/data";
import { q } from "@/lib/db";

export const metadata = { title: "New appointment" };
export default async function NewPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const sp = await searchParams;
  const [clients, services] = await Promise.all([
    q<{ id: number; first_name: string; last_name: string | null; phone: string }>(`SELECT id, first_name, last_name, phone FROM clients WHERE first_name <> 'Deleted' ORDER BY first_name`),
    getServices(),
  ]);
  return (
    <>
      <OwnerHeader title="New appointment" tag="owner-app" />
      <NewAppointment clients={clients} services={services} preClient={sp.client ? Number(sp.client) : undefined} />
    </>
  );
}
