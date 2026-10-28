import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import {
  adjustStock,
  deleteProduct,
  saveProduct,
  setAvailability,
} from "@/app/admin/product-actions";
import { PurchaseRequests } from "@/app/admin/requests";
import { buttonClass } from "@/components/ui/button";
import { categories, isCategory } from "@/lib/categories";
import { formatGtq } from "@/lib/format";
import { lowStockLimit, type Product } from "@/lib/products";
import type { PurchaseRequestRow } from "@/lib/supabase/database";

const fieldClass =
  "mt-2 h-12 w-full border border-black/10 bg-black/5 px-3 text-sm text-black outline-none focus:border-black/40";

const rowButtonClass =
  "inline-flex h-8 items-center justify-center border border-black/20 px-3 text-[10px] font-bold uppercase tracking-tight transition-colors duration-150 hover:bg-black hover:text-white";

type FormCode = "invalid" | "image" | "save";
type NoticeCode = "saved" | "updated" | "deleted";

function parseFormCode(value: string): FormCode | null {
  switch (value) {
    case "invalid":
    case "image":
    case "save":
      return value;
    default:
      return null;
  }
}

function parseNoticeCode(value: string): NoticeCode | null {
  switch (value) {
    case "saved":
    case "updated":
    case "deleted":
      return value;
    default:
      return null;
  }
}

function formMessage(code: FormCode | null) {
  switch (code) {
    case "invalid":
      return "Revisa título, precio, stock y categoría.";
    case "image":
      return "La imagen debe ser JPG, PNG o WEBP y pesar hasta 5 MB.";
    case "save":
      return "No se pudo guardar el producto.";
    case null:
      return null;
    default: {
      const unreachable: never = code;
      return unreachable;
    }
  }
}

function noticeMessage(code: NoticeCode | null) {
  switch (code) {
    case "saved":
      return "Producto publicado.";
    case "updated":
      return "Producto actualizado.";
    case "deleted":
      return "Producto eliminado.";
    case null:
      return null;
    default: {
      const unreachable: never = code;
      return unreachable;
    }
  }
}

export function Inventory({
  email,
  products,
  editId,
  confirmId,
  formCode,
  noticeCode,
  loadError,
  requests,
  requestsError,
  saleCode,
}: {
  email: string;
  products: Product[];
  editId: string;
  confirmId: string;
  formCode: string;
  noticeCode: string;
  loadError: boolean;
  requests: PurchaseRequestRow[];
  requestsError: boolean;
  saleCode: string;
}) {
  const editing = products.find((product) => product.id === editId) ?? null;
  const formError = formMessage(parseFormCode(formCode));
  const notice = noticeMessage(parseNoticeCode(noticeCode));
  const categoryOptions =
    editing && !isCategory(editing.category)
      ? [editing.category, ...categories]
      : [...categories];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-tight text-accent">
            Sesión activa
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">
            Inventario
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-black/60">{email}</p>
          <form action={signOut}>
            <button type="submit" className={buttonClass("secondary")}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        <form
          id="editor"
          action={saveProduct}
          className="space-y-4 border border-black/10 bg-neutral-100 p-6"
        >
          <h2 className="text-xl font-black uppercase tracking-tight">
            {editing ? "Editar producto" : "Nuevo producto"}
          </h2>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
            Título
            <input
              name="title"
              required
              defaultValue={editing?.title ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
            Descripción
            <textarea
              name="description"
              rows={4}
              defaultValue={editing?.description ?? ""}
              className={`${fieldClass} h-auto py-3`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              Precio (GTQ)
              <input
                name="price_gtq"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={editing?.price_gtq ?? ""}
                className={fieldClass}
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
              Stock
              <input
                name="stock"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={editing?.stock ?? 1}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
            Categoría
            <select
              name="category"
              defaultValue={editing?.category ?? categories[0]}
              className={fieldClass}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
            Imagen
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full text-sm text-black/70 file:mr-4 file:h-10 file:border-0 file:bg-black file:px-4 file:text-xs file:font-bold file:uppercase file:text-white"
            />
          </label>
          <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
            <input
              name="is_available"
              type="checkbox"
              defaultChecked={editing?.is_available ?? true}
              className="size-4 accent-black"
            />
            Visible en la tienda
          </label>
          {formError ? <p className="text-sm text-accent">{formError}</p> : null}
          {notice ? <p className="text-sm text-black">{notice}</p> : null}
          {loadError ? (
            <p className="text-sm text-accent">No se pudo cargar el inventario.</p>
          ) : null}
          <div className="flex gap-3">
            <button type="submit" className={buttonClass()}>
              {editing ? "Guardar" : "Publicar"}
            </button>
            {editing ? (
              <Link href="/admin" className={buttonClass("secondary")}>
                Cancelar
              </Link>
            ) : null}
          </div>
        </form>

        <section className="space-y-3">
          {products.length === 0 ? (
            <p className="border border-black/10 bg-neutral-100 px-6 py-16 text-center text-sm font-bold uppercase tracking-tight text-black/60">
              Todavía no hay productos
            </p>
          ) : (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                editId={editing?.id ?? ""}
                confirming={confirmId === product.id}
              />
            ))
          )}
        </section>
      </div>
      <PurchaseRequests
        requests={requests}
        products={products}
        loadError={requestsError}
        saleCode={saleCode}
      />
    </div>
  );
}

function ProductRow({
  product,
  editId,
  confirming,
}: {
  product: Product;
  editId: string;
  confirming: boolean;
}) {
  const lowStock = product.stock > 0 && product.stock <= lowStockLimit;
  const soldOut = product.stock === 0;

  return (
    <article className="flex flex-col gap-4 border border-black/10 bg-neutral-100 p-4 sm:flex-row">
      <div className="relative size-20 shrink-0 overflow-hidden bg-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight">
              {product.title}
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-black/50">
              {product.category}
              {product.is_available ? "" : " · Oculto"}
            </p>
          </div>
          <p className="font-mono text-sm">{formatGtq(product.price_gtq)}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <form action={adjustStock}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="delta" value="-1" />
            {editId ? <input type="hidden" name="edit" value={editId} /> : null}
            <button
              type="submit"
              disabled={soldOut}
              aria-label={`Quitar una unidad de ${product.title}`}
              className={`${rowButtonClass} w-8 px-0 disabled:opacity-40`}
            >
              −
            </button>
          </form>
          <p
            className={`min-w-16 text-center text-xs font-bold uppercase tracking-tight ${soldOut || lowStock ? "text-accent" : "text-black"}`}
          >
            {soldOut ? "Vendido" : `Stock ${product.stock}`}
          </p>
          <form action={adjustStock}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="delta" value="1" />
            {editId ? <input type="hidden" name="edit" value={editId} /> : null}
            <button
              type="submit"
              aria-label={`Sumar una unidad de ${product.title}`}
              className={`${rowButtonClass} w-8 px-0`}
            >
              +
            </button>
          </form>
          <Link href={`/admin?edit=${product.id}#editor`} className={rowButtonClass}>
            Editar
          </Link>
          <form action={setAvailability}>
            <input type="hidden" name="id" value={product.id} />
            <input
              type="hidden"
              name="available"
              value={product.is_available ? "false" : "true"}
            />
            {editId ? <input type="hidden" name="edit" value={editId} /> : null}
            <button
              type="submit"
              className={`${rowButtonClass} ${soldOut && product.is_available ? "border-accent text-accent" : ""}`}
            >
              {product.is_available
                ? soldOut
                  ? "Desactivar"
                  : "Ocultar"
                : "Publicar"}
            </button>
          </form>
          {confirming ? (
            <form action={deleteProduct} className="flex gap-2">
              <input type="hidden" name="id" value={product.id} />
              <button type="submit" className={`${rowButtonClass} border-accent text-accent`}>
                Eliminar ahora
              </button>
              <Link href="/admin" className={rowButtonClass}>
                Cancelar
              </Link>
            </form>
          ) : (
            <Link
              href={`/admin?confirm=${product.id}`}
              className={rowButtonClass}
            >
              Eliminar
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
