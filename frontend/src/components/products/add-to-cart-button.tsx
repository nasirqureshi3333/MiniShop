"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CartIcon, CheckIcon } from "@/components/ui/icons";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/api";

const FEEDBACK_DURATION_MS = 1500;

interface AddToCartButtonProps {
  product: Pick<Product, "id" | "name" | "stock">;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const t = useTranslations("product");
  const { add, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const inCart = getQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const isAtLimit = !isOutOfStock && inCart >= product.stock;

  const label = isOutOfStock ? t("outOfStock") : isAtLimit ? t("maxInCart") : justAdded ? t("added") : t("addToCart");

  return (
    <>
      <Button
        className={className}
        disabled={isOutOfStock || isAtLimit}
        onClick={() => {
          add(product.id, product.stock);
          setJustAdded(true);
        }}
      >
        {justAdded ? <CheckIcon className="size-4" /> : <CartIcon className="size-4" />}
        {label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {justAdded ? `${t("added")}: ${product.name}` : ""}
      </span>
    </>
  );
}
