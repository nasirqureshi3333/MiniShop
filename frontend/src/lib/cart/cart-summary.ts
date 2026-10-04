import type { Product } from "@/types/api";

import type { CartItem } from "./cart-reducer";

export type ProductAvailability =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "found"; product: Product };

export interface CartSummary {
  purchasableQuantity: number;
  subtotal: number;
  isPending: boolean;
  unavailableCount: number;
}

export function getPurchasableQuantity(item: CartItem, availability: ProductAvailability): number {
  switch (availability.status) {
    case "found":
      return Math.min(item.quantity, availability.product.stock);
    case "not_found":
      return 0;
    case "loading":
    case "error":
      return item.quantity;
  }
}

export function isUnavailable(availability: ProductAvailability): boolean {
  return (
    availability.status === "not_found" || (availability.status === "found" && availability.product.stock <= 0)
  );
}

export function summarizeCart(lines: { item: CartItem; availability: ProductAvailability }[]): CartSummary {
  let purchasableQuantity = 0;
  let subtotalCents = 0;
  let isPending = false;
  let unavailableCount = 0;

  for (const { item, availability } of lines) {
    const quantity = getPurchasableQuantity(item, availability);
    purchasableQuantity += quantity;
    if (availability.status === "found") {
      subtotalCents += Math.round(availability.product.price * 100) * quantity;
    } else if (availability.status !== "not_found") {
      isPending = true;
    }
    if (isUnavailable(availability)) unavailableCount += 1;
  }

  return { purchasableQuantity, subtotal: subtotalCents / 100, isPending, unavailableCount };
}
