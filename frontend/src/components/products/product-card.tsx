"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { EyeIcon } from "@/components/ui/icons";
import { useFormatPrice } from "@/hooks/use-format-price";
import { Link } from "@/i18n/navigation";
import { productHref } from "@/lib/product-route";
import type { Product } from "@/types/api";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";
import { StockStatus } from "./stock-status";

interface ProductCardProps {
  product: Product;
  preloadImage?: boolean;
}

export function ProductCard({ product, preloadImage }: ProductCardProps) {
  const t = useTranslations("product");
  const formatPrice = useFormatPrice();
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex w-full gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/70 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-600 sm:flex-col sm:gap-0 sm:p-3"
    >
      <div className="relative aspect-square w-28 shrink-0 self-start overflow-hidden rounded-xl bg-slate-100 sm:aspect-[4/3] sm:w-full">
        <ProductImage
          src={product.image}
          alt={product.name}
          preload={preloadImage}
          className="transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
        />
        <StockStatus stock={product.stock} variant="solid" className="absolute start-2 top-2" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:px-1 sm:pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 rtl:tracking-normal">
          {product.category.name}
        </span>
        <h3 id={titleId} className="font-semibold leading-snug text-slate-900">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">{product.description}</p>

        <p className="mt-auto pt-1 text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>

        <div className="mt-1 flex flex-col gap-1">
          <div className="relative z-10">
            <AddToCartButton product={product} className="h-9 w-full rounded-lg" />
          </div>
          <Link
            href={productHref(product.id)}
            aria-describedby={titleId}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-600 transition-colors after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <EyeIcon className="size-4" />
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
