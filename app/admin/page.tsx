import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminGate } from "@/app/admin/admin-gate";

export const metadata: Metadata = {
  title: "Inventario",
  robots: { index: false, follow: false },
};

export default function AdminPage(props: PageProps<"/admin">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <p className="text-xs font-bold uppercase tracking-tight text-black/50">
            Cargando
          </p>
        }
      >
        <AdminGate searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
