import { Suspense } from "react";
import Link from "next/link";
import { ProductSearch, ProductSearchForm } from "@/components/layout/product-search";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-2xl font-black uppercase tracking-tight"
        >
          American
        </Link>
        <nav className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold uppercase tracking-tight text-black/70 transition-colors duration-150 hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<ProductSearchForm />}>
          <ProductSearch />
        </Suspense>
      </div>
    </header>
  );
}
