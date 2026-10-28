import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase no está configurado.");
  }

  return createBrowserClient<Database>(env.url, env.anonKey);
}
