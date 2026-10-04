"use client";

import { useSearchParams } from "next/navigation";

import { parseProductId } from "@/lib/product-route";

import { ProductDetails } from "./product-details";
import { ProductNotFound } from "./product-not-found";

export function ProductPage() {
  const productId = parseProductId(useSearchParams().get("id"));
  if (productId === null) return <ProductNotFound />;
  return <ProductDetails productId={productId} />;
}
