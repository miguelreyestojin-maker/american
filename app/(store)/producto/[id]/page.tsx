import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createPurchase } from "@/app/(store)/producto/actions";
import { buttonClass } from "@/components/ui/button";
import { formatGtq } from "@/lib/format";
import { availabilityLabel, getProduct } from "@/lib/products";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ProductPage(props: ProductRouteProps) {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-16 text-center text-xs font-bold uppercase tracking-tight text-black/50">
          Cargando producto
        </p>
      }
    >
      <ProductDetail params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ProductDetail({ params, searchParams }: ProductRouteProps) {
  await connection();
  const { id } = await params;
  const query = await searchParams;
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  const received = first(query.solicitud) === "recibida";
  const buying = first(query.comprar) === "1" || first(query.pedido) !== "";
  const sold = product.stock <= 0;
  const label = availabilityLabel(product.stock);

  return (
    <article className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
      <div className="relative aspect-square overflow-hidden border border-black/10 bg-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div>
        <Link
          href="/#catalogo"
          className="text-xs font-bold uppercase tracking-tight text-black/50"
        >
          Catálogo
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-tight text-black/50">
          {product.category}
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight sm:text-5xl">
          {product.title}
        </h1>
        <p className="mt-4 font-mono text-2xl">{formatGtq(product.price_gtq)}</p>
        <p
          className={`mt-3 text-xs font-bold uppercase tracking-tight ${label === "Disponible" ? "text-black/60" : "text-accent"}`}
        >
          {label}
        </p>
        {product.description ? (
          <p className="mt-6 max-w-md text-sm text-black/70">{product.description}</p>
        ) : null}

        {received ? (
          <div className="mt-8 border border-black/10 bg-neutral-100 p-6">
            <p className="text-sm font-black uppercase tracking-tight text-accent">
              Atención al cliente ya recibió tu solicitud
            </p>
            <p className="mt-3 text-sm text-black/70">
              Te escribiremos por WhatsApp para confirmar la compra.
            </p>
            <Link href="/#catalogo" className={`${buttonClass()} mt-6`}>
              Volver al catálogo
            </Link>
          </div>
        ) : null}

        {sold && !received ? (
          <p className="mt-8 text-sm font-black uppercase tracking-tight text-accent">
            Este producto ya se vendió
          </p>
        ) : null}

        {!sold && !received && !buying ? (
          <Link href={`/producto/${product.id}?comprar=1#pedido`} className={`${buttonClass()} mt-8`}>
            Comprar
          </Link>
        ) : null}

        {!sold && !received && buying ? (
          <form id="pedido" action={createPurchase} className="mt-8 max-w-md space-y-4 border border-black/10 bg-neutral-100 p-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Tu solicitud</h2>
            <input type="hidden" name="product_id" value={product.id} />
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              Nombre
              <input name="name" required autoComplete="name" className={fieldClass} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              WhatsApp
              <input
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="5555 5555"
                className={fieldClass}
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              Cantidad
              <input
                name="quantity"
                type="number"
                min={1}
                max={product.stock}
                defaultValue={1}
                required
                className={fieldClass}
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              Nota
              <input name="note" placeholder="Talla u otro detalle" className={fieldClass} />
            </label>
            <PurchaseError code={first(query.pedido)} />
            <button type="submit" className={buttonClass()}>
              Aceptar
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

const fieldClass =
  "mt-2 h-12 w-full border border-black/10 bg-black/5 px-3 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40";

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function PurchaseError({ code }: { code: string }) {
  const message = purchaseError(code);
  if (!message) {
    return null;
  }

  return <p className="text-sm text-accent">{message}</p>;
}

function purchaseError(code: string) {
  switch (code) {
    case "invalid":
      return "Revisa tu nombre, un WhatsApp de Guatemala y la cantidad.";
    case "stock":
      return "Ya no hay suficientes unidades.";
    case "save":
      return "No se pudo enviar la solicitud.";
    case "":
      return null;
    default:
      return null;
  }
}
