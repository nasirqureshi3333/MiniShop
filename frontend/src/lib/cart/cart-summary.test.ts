import { describe, expect, it } from "vitest";

import type { Product } from "@/types/api";

import { type ProductAvailability, getPurchasableQuantity, summarizeCart } from "./cart-summary";

const product = (price: number, stock: number): Product => ({
  id: 1,
  name: "Item",
  description: "",
  price,
  category: { slug: "misc", name: "Misc" },
  image: "https://example.com/item.jpg",
  stock,
  in_stock: stock > 0,
});

const found = (price: number, stock: number): ProductAvailability => ({ status: "found", product: product(price, stock) });
const line = (productId: number, quantity: number, availability: ProductAvailability) => ({
  item: { productId, quantity },
  availability,
});

describe("summarizeCart", () => {
  it("sums line totals in cents without floating-point drift", () => {
    const summary = summarizeCart([line(1, 1, found(0.1, 10)), line(2, 1, found(0.2, 10))]);
    expect(summary.subtotal).toBe(0.3);
    expect(summarizeCart([line(1, 3, found(79.99, 10))]).subtotal).toBe(239.97);
  });

  it("caps quantities at the available stock", () => {
    const summary = summarizeCart([line(1, 50, found(10, 5))]);
    expect(summary).toMatchObject({ purchasableQuantity: 5, subtotal: 50, unavailableCount: 0 });
  });

  it("excludes out-of-stock and removed products from all totals", () => {
    const summary = summarizeCart([
      line(1, 2, found(10, 5)),
      line(2, 3, found(99, 0)),
      line(3, 4, { status: "not_found" }),
    ]);
    expect(summary).toEqual({ purchasableQuantity: 2, subtotal: 20, isPending: false, unavailableCount: 2 });
  });

  it("is pending while any product is loading or failed", () => {
    expect(summarizeCart([line(1, 1, { status: "loading" })]).isPending).toBe(true);
    expect(summarizeCart([line(1, 1, { status: "error" })]).isPending).toBe(true);
    expect(summarizeCart([line(1, 1, found(5, 5))]).isPending).toBe(false);
  });

  it("returns zeros for an empty cart", () => {
    expect(summarizeCart([])).toEqual({ purchasableQuantity: 0, subtotal: 0, isPending: false, unavailableCount: 0 });
  });
});

describe("getPurchasableQuantity", () => {
  it("counts the selected quantity while the product is still unknown", () => {
    expect(getPurchasableQuantity({ productId: 1, quantity: 3 }, { status: "loading" })).toBe(3);
  });
});
