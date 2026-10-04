"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { BackArrowIcon } from "@/components/ui/icons";
import { StateMessage } from "@/components/ui/state-message";
import { useProduct } from "@/hooks/use-catalog-queries";
import { useCart } from "@/hooks/use-cart";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useFormatPrice } from "@/hooks/use-format-price";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/api-error";
import { getErrorMessageKey } from "@/lib/api/error-messages";

import { AddToCartButton } from "./add-to-cart-button";
import { BackToProductsLink } from "./back-to-products-link";
import { ProductNotFound } from "./product-not-found";
import { StockStatus } from "./stock-status";
import { ZoomableProductImage } from "./zoomable-product-image";

function BackLink() {
  const t = useTranslations("product");
  return (
    <BackToProductsLink className="inline-flex items-center gap-2 self-start text-sm font-medium text-brand-700 hover:underline">
      <BackArrowIcon />
      {t("backToProducts")}
    </BackToProductsLink>
  );
}

export function ProductDetailsLoading() {
  const t = useTranslations("states");
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy>
      <span className="sr-only">{t("loading")}</span>
      <BackLink />
      <ProductDetailsSkeleton />
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-8 md:grid-cols-2">
      <div className="aspect-[4/3] rounded-2xl bg-slate-200 md:aspect-square" />
      <div className="space-y-4">
        <div className="h-4 w-1/4 rounded bg-slate-200" />
        <div className="h-8 w-3/4 rounded bg-slate-200" />
        <div className="h-8 w-1/3 rounded bg-slate-200" />
        <div className="h-24 w-full rounded bg-slate-200" />
        <div className="h-11 w-40 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export function ProductDetails({ productId }: { productId: number }) {
  const t = useTranslations();
  const formatPrice = useFormatPrice();
  const { getQuantity } = useCart();
  const { data: product, isPending, isError, error, refetch } = useProduct(productId);
  useDocumentTitle(product && `${product.name} | ${t("metadata.title")}`);

  if (isPending) return <ProductDetailsLoading />;

  if (isError) {
    if (error instanceof ApiError && error.isNotFound) return <ProductNotFound />;
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <StateMessage
          tone="error"
          title={t("states.errorTitle")}
          description={t(`states.${getErrorMessageKey(error)}`)}
          action={<Button onClick={() => refetch()}>{t("states.retry")}</Button>}
        />
      </div>
    );
  }

  const inCart = getQuantity(product.id);
  const inCartLink = inCart > 0 && (
    <Link href="/cart" className="text-sm font-medium text-brand-700 hover:underline">
      {t("product.inCart", { count: inCart })}
    </Link>
  );

  return (
    <article className="flex flex-col gap-6 pb-24 md:pb-0">
      <BackLink />

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:aspect-square">
          <ZoomableProductImage src={product.image} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700 rtl:tracking-normal">
              <span className="sr-only">{t("product.category")}: </span>
              {product.category.name}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
          </div>

          <p className="text-3xl font-bold text-slate-900">
            <span className="sr-only">{t("product.price")}: </span>
            {formatPrice(product.price)}
          </p>

          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 text-sm">
            <dt className="text-slate-500">{t("product.category")}</dt>
            <dd className="font-medium text-slate-900">{product.category.name}</dd>
            <dt className="text-slate-500">{t("product.availability")}</dt>
            <dd>
              <StockStatus stock={product.stock} />
            </dd>
          </dl>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">{t("product.description")}</h2>
            <p className="leading-relaxed text-slate-700">{product.description}</p>
          </section>

          <div className="hidden flex-wrap items-center gap-4 border-t border-slate-200 pt-5 md:flex">
            <AddToCartButton product={product} className="min-w-44" />
            {inCartLink}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>
            {inCartLink}
          </div>
          <AddToCartButton product={product} className="shrink-0" />
        </div>
      </div>
    </article>
  );
}
