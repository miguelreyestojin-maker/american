import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase no está configurado.");
  }

  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
