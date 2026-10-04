"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { BackToProductsLink } from "@/components/products/back-to-products-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { CartIcon } from "@/components/ui/icons";
import { StateMessage } from "@/components/ui/state-message";
import { useIsClient } from "@/hooks/use-cart";
import { useCartDetails } from "@/hooks/use-cart-details";
import { useFormatPrice } from "@/hooks/use-format-price";

import { CartLine } from "./cart-line";

function CartSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="h-64 rounded-2xl bg-slate-200" />
      <div className="h-48 rounded-2xl bg-slate-200" />
    </div>
  );
}

function ClearCartControl({ onClear }: { onClear: () => void }) {
  const t = useTranslations("cart");
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsConfirming(true)}>
        {t("clear")}
      </Button>
    );
  }

  return (
    <div role="alertdialog" aria-label={t("clearConfirm")} className="flex flex-wrap items-center justify-end gap-2">
      <p className="text-sm font-medium text-slate-700">{t("clearConfirm")}</p>
      <Button variant="secondary" size="sm" onClick={() => setIsConfirming(false)} autoFocus>
        {t("cancel")}
      </Button>
      <Button variant="destructive" size="sm" onClick={onClear}>
        {t("clearConfirmYes")}
      </Button>
    </div>
  );
}

export function CartView() {
  const t = useTranslations();
  const format = useFormatter();
  const formatPrice = useFormatPrice();
  const isClient = useIsClient();
  const { cart, lines, summary, unavailableIds } = useCartDetails();

  if (!isClient) {
    return (
      <div role="status" aria-busy>
        <span className="sr-only">{t("states.loading")}</span>
        <CartSkeleton />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <StateMessage
        icon={<CartIcon className="size-6" />}
        title={t("cart.emptyTitle")}
        description={t("cart.emptyDescription")}
        action={<BackToProductsLink className={buttonClasses()}>{t("cart.continueShopping")}</BackToProductsLink>}
      />
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
      <section aria-label={t("cart.title")} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-200">
          {lines.map(({ item, query, availability }) => (
            <CartLine
              key={item.productId}
              item={item}
              query={query}
              availability={availability}
              onIncrement={(max) => cart.increment(item.productId, max)}
              onDecrement={() => cart.decrement(item.productId)}
              onRemove={() => cart.remove(item.productId)}
            />
          ))}
        </ul>
        <div className="flex justify-end border-t border-slate-200 p-4">
          <ClearCartControl onClear={cart.clear} />
        </div>
      </section>

      <aside
        aria-labelledby="cart-summary-heading"
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <h2 id="cart-summary-heading" className="text-lg font-semibold text-slate-900">
          {t("cart.summary")}
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("cart.totalItems")}</dt>
            <dd className="font-medium tabular-nums">{format.number(summary.purchasableQuantity)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
            <dt className="font-semibold">{t("cart.subtotal")}</dt>
            <dd aria-live="polite" className="font-bold tabular-nums">
              {summary.isPending ? t("cart.subtotalPending") : formatPrice(summary.subtotal)}
            </dd>
          </div>
        </dl>

        {unavailableIds.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <p>{t("cart.unavailableExcluded")}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => unavailableIds.forEach((productId) => cart.remove(productId))}
            >
              {t("cart.removeUnavailable")}
            </Button>
          </div>
        )}

        <p className="text-xs text-slate-500">{t("cart.checkoutNote")}</p>
        <BackToProductsLink className={buttonClasses({ variant: "secondary" })}>
          {t("cart.continueShopping")}
        </BackToProductsLink>
      </aside>
    </div>
  );
}
