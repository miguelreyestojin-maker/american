"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "@/lib/purchases";
import { requireAdmin } from "@/lib/supabase/admin";

export async function confirmPurchase(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) {
    redirect("/admin");
  }

  const { data } = await supabase
    .from("purchase_requests")
    .select("product_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.rpc("confirm_purchase", { request_id: id });
  if (error) {
    console.error(error.message);
    const code = error.message.includes("sin stock") ? "stock" : "save";
    redirect(`/admin?sale=${code}#solicitudes`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  if (data?.product_id) {
    revalidatePath(`/producto/${data.product_id}`);
  }
  redirect("/admin?sale=sold#solicitudes");
}
