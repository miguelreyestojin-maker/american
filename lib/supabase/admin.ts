import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function isAdminRole(role: unknown) {
  return role === "admin";
}

export async function requireAdmin() {
  if (!getSupabaseEnv()) {
    redirect("/admin?error=config");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminRole(data.user?.app_metadata.role)) {
    redirect("/admin?error=forbidden");
  }

  return supabase;
}
