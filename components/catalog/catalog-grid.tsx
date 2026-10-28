import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { buttonClass } from "@/components/ui/button";
import { getCatalogProducts, type CatalogSnapshot } from "@/lib/products";

export async function CatalogGrid({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const snapshot = await getCatalogProducts(query);

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <CatalogBody snapshot={snapshot} query={query} />
    </div>
  );
}

function CatalogBody({
  snapshot,
  query,
}: {
  snapshot: CatalogSnapshot;
  query: string;
}) {
  switch (snapshot.status) {
    case "unconfigured":
      return (
        <CatalogNotice
          title="Sin productos publicados"
          body="El inventario local de Guatemala aparecerá en esta grilla."
          hint={
            process.env.NODE_ENV === "development"
              ? "Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local y ejecuta la migración de Supabase."
              : undefined
          }
        />
      );
    case "error":
      return (
        <CatalogNotice
          title="No se pudo cargar el inventario"
          body="Inténtalo de nuevo en un momento."
        />
      );
    case "ready":
      if (snapshot.products.length === 0) {
        return (
          <CatalogNotice
            title={query ? "Sin resultados" : "Sin productos publicados"}
            body={
              query
                ? `No hay artículos para “${query}”.`
                : "El inventario local de Guatemala aparecerá en esta grilla."
            }
            clearSearch={Boolean(query)}
          />
        );
      }

      return snapshot.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ));
    default: {
      const unreachable: never = snapshot;
      return unreachable;
    }
  }
}

function CatalogNotice({
  title,
  body,
  hint,
  clearSearch = false,
}: {
  title: string;
  body: string;
  hint?: string;
  clearSearch?: boolean;
}) {
  return (
    <div className="col-span-full border border-black/10 bg-neutral-100 px-6 py-20 text-center">
      <p className="text-sm font-black uppercase tracking-tight">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-black/60">{body}</p>
      {hint ? (
        <p className="mx-auto mt-3 max-w-md text-xs text-accent">{hint}</p>
      ) : null}
      {clearSearch ? (
        <Link href="/" className={`${buttonClass("secondary")} mt-6`}>
          Limpiar búsqueda
        </Link>
      ) : null}
    </div>
  );
}
