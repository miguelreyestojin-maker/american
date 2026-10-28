import { createPublicClient } from "@/lib/supabase/public";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { ProductRow } from "@/lib/supabase/database";

export const lowStockLimit = 3;

export function availabilityLabel(stock: number) {
  if (stock <= 0) {
    return "Vendido";
  }

  if (stock <= lowStockLimit) {
    return "Últimas unidades";
  }

  return "Disponible";
}

export type Product = Omit<ProductRow, "price_gtq"> & {
  price_gtq: number;
};

export type CatalogSnapshot =
  | { status: "unconfigured" }
  | { status: "error" }
  | { status: "ready"; products: Product[] };

function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function getCatalogProducts(
  query: string,
): Promise<CatalogSnapshot> {
  if (!getSupabaseEnv()) {
    return { status: "unconfigured" };
  }

  const supabase = createPublicClient();
  let request = supabase
    .from("products")
    .select(
      "id, created_at, title, description, price_gtq, stock, category, image_url, is_available",
    )
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  const term = query.trim();
  if (term) {
    request = request.ilike("title", `%${escapeIlike(term)}%`);
  }

  const { data, error } = await request;
  if (error) {
    console.error(error.message);
    return { status: "error" };
  }

  return {
    status: "ready",
    products: data.map(toProduct),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!getSupabaseEnv()) {
    return null;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, created_at, title, description, price_gtq, stock, category, image_url, is_available",
    )
    .eq("id", id)
    .eq("is_available", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(error.message);
    }
    return null;
  }

  return toProduct(data);
}

function toProduct(row: ProductRow): Product {
  return {
    ...row,
    price_gtq: Number(row.price_gtq),
  };
}
