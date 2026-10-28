import { connection } from "next/server";
import { signIn } from "@/app/admin/actions";
import { Inventory } from "@/app/admin/inventory";
import { buttonClass } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import type { ProductRow } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

type LoginError = "auth" | "forbidden" | "config";

function parseLoginError(value: string | undefined): LoginError | null {
  if (value === "auth" || value === "forbidden" || value === "config") {
    return value;
  }

  return null;
}

function loginErrorMessage(error: LoginError | null) {
  switch (error) {
    case "auth":
      return "Correo o contraseña incorrectos.";
    case "forbidden":
      return "Esta cuenta no tiene permiso de administrador.";
    case "config":
      return "Supabase no está configurado.";
    case null:
      return null;
    default: {
      const unreachable: never = error;
      return unreachable;
    }
  }
}

export async function AdminGate({
  searchParams,
}: {
  searchParams: PageProps<"/admin">["searchParams"];
}) {
  await connection();
  const params = await searchParams;
  const raw = params.error;
  const error = loginErrorMessage(
    parseLoginError(Array.isArray(raw) ? raw[0] : raw),
  );

  if (!getSupabaseEnv()) {
    return (
      <AdminShell>
        <p className="text-sm text-black/70">
          Falta la conexión con Supabase en `.env.local`.
        </p>
      </AdminShell>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user?.app_metadata.role === "admin") {
    const [{ data, error: loadError }, requestsResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, created_at, title, description, price_gtq, stock, category, image_url, is_available",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("purchase_requests")
        .select(
          "id, created_at, product_id, customer_name, phone, quantity, note, status",
        )
        .order("created_at", { ascending: false }),
    ]);

    return (
      <Inventory
        email={user.email ?? ""}
        products={(data ?? []).map(toProduct)}
        editId={first(params.edit)}
        confirmId={first(params.confirm)}
        formCode={first(params.form)}
        noticeCode={first(params.notice)}
        loadError={Boolean(loadError)}
        requests={requestsResult.data ?? []}
        requestsError={Boolean(requestsResult.error)}
        saleCode={first(params.sale)}
      />
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
    <AdminShell>
      <h1 className="text-4xl font-black uppercase tracking-tight">Acceso</h1>
      <form action={signIn} className="mt-8 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
          Correo
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-2 h-12 w-full border border-black/10 bg-black/5 px-3 text-sm text-black outline-none focus:border-black/40"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-tight text-black/60">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 h-12 w-full border border-black/10 bg-black/5 px-3 text-sm text-black outline-none focus:border-black/40"
          />
        </label>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button type="submit" className={`${buttonClass()} w-full`}>
          Entrar
        </button>
      </form>
    </AdminShell>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function toProduct(row: ProductRow): Product {
  return {
    ...row,
    price_gtq: Number(row.price_gtq),
  };
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full max-w-md border border-black/10 bg-neutral-100 p-8">
      {children}
    </section>
  );
}
