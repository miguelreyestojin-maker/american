"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProduct } from "@/lib/products";
import { isUuid, normalizePhone } from "@/lib/purchases";
import { createPublicClient } from "@/lib/supabase/public";

function back(id: string, code: "invalid" | "stock" | "save"): never {
  redirect(`/producto/${id}?comprar=1&pedido=${code}#pedido`);
}

export async function createPurchase(formData: FormData) {
  const id = String(formData.get("product_id") ?? "");
  if (!isUuid(id)) {
    redirect("/");
  }

  const product = await getProduct(id);
  if (!product || product.stock <= 0) {
    redirect(`/producto/${id}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const quantity = Number(formData.get("quantity"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);

  if (
    name.length < 2 ||
    !phone ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > product.stock
  ) {
    back(id, "invalid");
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("purchase_requests").insert({
    product_id: id,
    customer_name: name,
    phone,
    quantity,
    note,
    status: "pending",
  });

  if (error) {
    console.error(error.message);
    back(id, error.code === "42501" ? "stock" : "save");
  }

  revalidatePath("/admin");
  redirect(`/producto/${id}?solicitud=recibida`);
}
