"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

import { ApiError } from "@/lib/api/api-error";
import { type ProductAvailability, isUnavailable, summarizeCart } from "@/lib/cart/cart-summary";
import type { Product } from "@/types/api";

import { useCart } from "./use-cart";
import { useProductsByIds } from "./use-catalog-queries";

function toAvailability(query: UseQueryResult<Product>): ProductAvailability {
  if (query.data) return { status: "found", product: query.data };
  if (query.isPending) return { status: "loading" };
  if (query.error instanceof ApiError && query.error.isNotFound) return { status: "not_found" };
  return { status: "error" };
}

export function useCartDetails() {
  const cart = useCart();
  const queries = useProductsByIds(cart.items.map((item) => item.productId));

  const lines = cart.items.map((item, index) => ({
    item,
    query: queries[index],
    availability: toAvailability(queries[index]),
  }));
  const summary = summarizeCart(lines);
  const unavailableIds = lines.filter((line) => isUnavailable(line.availability)).map((line) => line.item.productId);

  const overStock = lines
    .flatMap(({ item, availability }) =>
      availability.status === "found" && availability.product.stock > 0 && item.quantity > availability.product.stock
        ? [`${item.productId}:${availability.product.stock}`]
        : [],
    )
    .join(",");

  const { clamp } = cart;
  useEffect(() => {
    if (!overStock) return;
    for (const pair of overStock.split(",")) {
      const [productId, stock] = pair.split(":").map(Number);
      clamp(productId, stock);
    }
  }, [overStock, clamp]);

  return { cart, lines, summary, unavailableIds };
}
