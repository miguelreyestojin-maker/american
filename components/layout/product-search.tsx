"use client";

import { useSearchParams } from "next/navigation";

export function ProductSearch() {
  const query = useSearchParams().get("q") ?? "";
  return <ProductSearchForm query={query} />;
}

export function ProductSearchForm({ query = "" }: { query?: string }) {
  return (
    <form
      action="/#catalogo"
      method="get"
      className="flex w-full md:ml-auto md:w-80"
    >
      <label htmlFor="q" className="sr-only">
        Buscar productos
      </label>
      <input
        id="q"
        name="q"
        type="search"
        placeholder="Buscar productos"
        defaultValue={query}
        key={query}
        className="h-10 min-w-0 flex-1 border border-black/10 bg-black/5 px-3 text-sm text-black outline-none placeholder:text-black/40 focus:border-black/40"
      />
      <button
        type="submit"
        className="h-10 border border-l-0 border-black/10 px-3 text-xs font-bold uppercase tracking-tight text-black transition-colors duration-150 hover:bg-black hover:text-white"
      >
        Buscar
      </button>
    </form>
  );
}
