import { SiteHeader } from "@/components/layout/site-header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs font-bold uppercase tracking-tight text-black/40 sm:px-6">
          Guatemala · Precios en quetzales
        </p>
      </footer>
    </>
  );
}
