"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { ProductImage } from "@/components/products/product-image";
import { StockStatus } from "@/components/products/stock-status";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import { useFormatPrice } from "@/hooks/use-format-price";
import { Link } from "@/i18n/navigation";
import type { CartItem } from "@/lib/cart/cart-reducer";
import { productHref } from "@/lib/product-route";
import { type ProductAvailability, getPurchasableQuantity } from "@/lib/cart/cart-summary";
import type { Product } from "@/types/api";

import { QuantityControl } from "./quantity-control";

interface CartLineProps {
  item: CartItem;
  query: UseQueryResult<Product>;
  availability: ProductAvailability;
  onIncrement: (maxQuantity: number) => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function RemoveButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useTranslations("cart");
  return (
    <Button variant="danger" size="sm" onClick={onRemove} aria-label={label} className="w-9 shrink-0 px-0 sm:w-auto sm:px-3">
      <TrashIcon className="size-4" />
      <span className="hidden sm:inline">{t("remove")}</span>
    </Button>
  );
}

function LineSkeleton() {
  return (
    <li aria-hidden className="flex animate-pulse gap-4 p-4">
      <div className="size-20 shrink-0 rounded-lg bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-1/4 rounded bg-slate-200" />
        <div className="h-9 w-32 rounded bg-slate-200" />
      </div>
    </li>
  );
}

export function CartLine({ item, query, availability, onIncrement, onDecrement, onRemove }: CartLineProps) {
  const t = useTranslations();
  const formatPrice = useFormatPrice();

  if (availability.status === "loading") return <LineSkeleton />;

  if (availability.status === "not_found" || availability.status === "error") {
    const isGone = availability.status === "not_found";
    return (
      <li className="flex items-center justify-between gap-4 p-4">
        <p role="alert" className="text-sm text-slate-600">
          {isGone ? t("cart.unavailable") : t("cart.itemError")}
        </p>
        <div className="flex gap-2">
          {!isGone && (
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              {t("states.retry")}
            </Button>
          )}
          <RemoveButton label={t("cart.remove")} onRemove={onRemove} />
        </div>
      </li>
    );
  }

  const { product } = availability;
  const isOutOfStock = product.stock <= 0;
  const quantity = getPurchasableQuantity(item, availability);

  return (
    <li className={`flex gap-3 p-3 sm:gap-4 sm:p-4 ${isOutOfStock ? "bg-slate-50" : ""}`}>
      <div className={`relative size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:size-24 ${isOutOfStock ? "opacity-60" : ""}`}>
        <ProductImage src={product.image} alt={product.name} sizes="96px" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <Link href={productHref(product.id)} className="font-semibold text-slate-900 hover:text-brand-700">
              {product.name}
            </Link>
            <p className="text-xs text-slate-500">{product.category.name}</p>
          </div>
          {!isOutOfStock && (
            <p className="font-semibold tabular-nums text-slate-900">{formatPrice(product.price * quantity)}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>{t("cart.eachPrice", { price: formatPrice(product.price) })}</span>
          <StockStatus stock={product.stock} />
        </div>

        <div className="flex items-center justify-between gap-2">
          {isOutOfStock ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {t("product.outOfStock")}
            </p>
          ) : (
            <QuantityControl
              productName={product.name}
              quantity={quantity}
              max={product.stock}
              onIncrement={() => onIncrement(product.stock)}
              onDecrement={onDecrement}
            />
          )}
          <RemoveButton label={t("cart.removeItem", { name: product.name })} onRemove={onRemove} />
        </div>
      </div>
    </li>
  );
}
