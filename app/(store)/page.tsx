import { Suspense } from "react";
import Link from "next/link";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { HeroCarousel } from "@/components/layout/hero-carousel";
import { buttonClass } from "@/components/ui/button";

export default function HomePage(props: PageProps<"/">) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10">
        <HeroCarousel />
        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pt-20 pb-16 sm:px-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-tight text-accent">
            Importados de EE. UU. · Stock en Guatemala
          </p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            Nuevos
            <br />
            drops
          </h1>
          <p className="mt-6 max-w-md text-sm text-black/70 sm:text-base">
            Calzado, ropa, accesorios y electrónica originales traídos de
            Estados Unidos. Disponibles con stock local y precio en quetzales.
          </p>
          <div className="mt-8">
            <Link href="/#catalogo" className={`pointer-events-auto ${buttonClass()}`}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <section
        id="catalogo"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6"
      >
        <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Catálogo
        </h2>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogGrid searchParams={props.searchParams} />
        </Suspense>
      </section>
    </>
  );
}

function CatalogFallback() {
  return (
    <div className="mt-8 border border-black/10 bg-neutral-100 px-6 py-20 text-center text-xs font-bold uppercase tracking-tight text-black/50">
      Cargando catálogo
    </div>
  );
}
