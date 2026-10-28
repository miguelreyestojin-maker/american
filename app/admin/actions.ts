"use server";

import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function signIn(formData: FormData) {
  if (!getSupabaseEnv()) {
    redirect("/admin?error=config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/admin?error=auth");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/admin?error=auth");
  }

  const { data } = await supabase.auth.getUser();
  if (!isAdminRole(data.user?.app_metadata.role)) {
    await supabase.auth.signOut();
    redirect("/admin?error=forbidden");
  }

  redirect("/admin");
}

export async function signOut() {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/admin");
}
