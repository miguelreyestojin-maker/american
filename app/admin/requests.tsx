import { confirmPurchase } from "@/app/admin/purchase-actions";
import { whatsAppHref } from "@/lib/purchases";
import type { PurchaseRequestRow } from "@/lib/supabase/database";
import type { Product } from "@/lib/products";

const rowButtonClass =
  "inline-flex h-8 items-center justify-center border border-black/20 px-3 text-[10px] font-bold uppercase tracking-tight transition-colors duration-150 hover:bg-black hover:text-white";

export function PurchaseRequests({
  requests,
  products,
  loadError,
  saleCode,
}: {
  requests: PurchaseRequestRow[];
  products: Product[];
  loadError: boolean;
  saleCode: string;
}) {
  const message = saleMessage(saleCode);

  return (
    <section id="solicitudes" className="scroll-mt-24 border-t border-black/10 pt-8">
      <h2 className="text-3xl font-black uppercase tracking-tight">Solicitudes</h2>
      <p className="mt-2 max-w-xl text-sm text-black/60">
        Confirma cada compra por WhatsApp. Cuando el cliente acepte, márcala como vendida.
      </p>
      {message ? <p className="mt-4 text-sm text-accent">{message}</p> : null}
      {loadError ? (
        <p className="mt-4 text-sm text-accent">
          No se pudieron cargar las solicitudes. Ejecuta la migración de compras en Supabase.
        </p>
      ) : null}
      {requests.length === 0 && !loadError ? (
        <p className="mt-6 border border-black/10 bg-neutral-100 px-6 py-12 text-center text-sm font-bold uppercase tracking-tight text-black/60">
          No hay solicitudes
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((request) => {
            const title =
              products.find((product) => product.id === request.product_id)?.title ??
              "Producto";
            const sold = request.status === "sold";

            return (
              <article
                key={request.id}
                className="flex flex-col gap-4 border border-black/10 bg-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">
                    {request.customer_name}
                  </p>
                  <p className="mt-1 text-xs text-black/60">
                    {title} · {request.quantity}{" "}
                    {request.quantity === 1 ? "unidad" : "unidades"} · {request.phone}
                  </p>
                  {request.note ? (
                    <p className="mt-1 text-xs text-black/50">{request.note}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sold ? (
                    <p className="text-[10px] font-bold uppercase tracking-tight text-accent">
                      Vendido
                    </p>
                  ) : (
                    <>
                      <a
                        href={whatsAppHref(request.phone, request.customer_name, title)}
                        target="_blank"
                        rel="noreferrer"
                        className={rowButtonClass}
                      >
                        WhatsApp
                      </a>
                      <form action={confirmPurchase}>
                        <input type="hidden" name="id" value={request.id} />
                        <button type="submit" className={`${rowButtonClass} border-accent text-accent`}>
                          Marcar vendido
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function saleMessage(code: string) {
  switch (code) {
    case "sold":
      return "Compra marcada como vendida.";
    case "stock":
      return "No hay suficiente stock para esa solicitud.";
    case "save":
      return "No se pudo confirmar la compra.";
    case "":
      return null;
    default:
      return null;
  }
}
