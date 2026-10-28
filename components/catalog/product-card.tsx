import Image from "next/image";
import Link from "next/link";
import { formatGtq } from "@/lib/format";
import { availabilityLabel, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const label = availabilityLabel(product.stock);

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group block border border-black/10 bg-neutral-100"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-150 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-[10px] font-bold uppercase tracking-tight text-black/50">
          {product.category}
        </p>
        <h3 className="text-sm font-black uppercase leading-tight tracking-tight">
          {product.title}
        </h3>
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-sm">{formatGtq(product.price_gtq)}</p>
          <p
            className={`text-[10px] font-bold uppercase tracking-tight ${label === "Disponible" ? "text-black/60" : "text-accent"}`}
          >
            {label}
          </p>
        </div>
      </div>
    </Link>
  );
}
