import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export async function CatalogEmpty({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  return (
    <div className="col-span-full border border-black/10 bg-neutral-100 px-6 py-20 text-center">
      <p className="text-sm font-black uppercase tracking-tight">
        {query ? "Sin resultados" : "Sin productos publicados"}
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-black/60">
        {query
          ? `No hay artículos para “${query}”.`
          : "El inventario local de Guatemala aparecerá en esta grilla."}
      </p>
      {query ? (
        <Link href="/" className={`${buttonClass("secondary")} mt-6`}>
          Limpiar búsqueda
        </Link>
      ) : null}
    </div>
  );
}
