import type { Product } from "@/types/api";

import { ProductCard } from "./product-card";

const GRID_CLASSES = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const PRELOADED_IMAGES = 4;

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className={GRID_CLASSES}>
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} preloadImage={index < PRELOADED_IMAGES} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={GRID_CLASSES} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex animate-pulse gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:flex-col sm:gap-0 sm:p-3"
        >
          <div className="aspect-square w-28 shrink-0 rounded-xl bg-slate-200 sm:aspect-[4/3] sm:w-full" />
          <div className="flex-1 space-y-2.5 sm:px-1 sm:pt-3">
            <div className="h-2.5 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-5 w-1/4 rounded bg-slate-200" />
            <div className="h-9 rounded-lg bg-slate-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
