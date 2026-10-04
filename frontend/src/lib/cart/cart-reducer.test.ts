import { describe, expect, it } from "vitest";

import { type CartState, EMPTY_CART, cartReducer } from "./cart-reducer";

const withItems = (...items: [number, number][]): CartState => ({
  items: items.map(([productId, quantity]) => ({ productId, quantity })),
});

describe("cartReducer", () => {
  it("adds a new product with quantity 1", () => {
    expect(cartReducer(EMPTY_CART, { type: "add", productId: 1, maxQuantity: 5 })).toEqual(withItems([1, 1]));
  });

  it("increases quantity when adding an existing product", () => {
    expect(cartReducer(withItems([1, 1]), { type: "add", productId: 1, maxQuantity: 5 })).toEqual(withItems([1, 2]));
  });

  it("never exceeds the available stock", () => {
    const state = withItems([1, 3]);
    expect(cartReducer(state, { type: "add", productId: 1, maxQuantity: 3 })).toBe(state);
    expect(cartReducer(state, { type: "increment", productId: 1, maxQuantity: 3 })).toBe(state);
  });

  it("ignores out-of-stock products", () => {
    expect(cartReducer(EMPTY_CART, { type: "add", productId: 1, maxQuantity: 0 })).toBe(EMPTY_CART);
  });

  it("increments and decrements quantity", () => {
    const incremented = cartReducer(withItems([1, 1]), { type: "increment", productId: 1, maxQuantity: 5 });
    expect(incremented).toEqual(withItems([1, 2]));
    expect(cartReducer(incremented, { type: "decrement", productId: 1 })).toEqual(withItems([1, 1]));
  });

  it("does not decrement below 1", () => {
    const state = withItems([1, 1]);
    expect(cartReducer(state, { type: "decrement", productId: 1 })).toBe(state);
  });

  it("removes a product and leaves others untouched", () => {
    expect(cartReducer(withItems([1, 2], [2, 1]), { type: "remove", productId: 1 })).toEqual(withItems([2, 1]));
  });

  it("returns the same state for no-op actions", () => {
    const state = withItems([1, 1]);
    expect(cartReducer(state, { type: "remove", productId: 99 })).toBe(state);
    expect(cartReducer(state, { type: "increment", productId: 99, maxQuantity: 5 })).toBe(state);
    expect(cartReducer(EMPTY_CART, { type: "clear" })).toBe(EMPTY_CART);
  });

  it("clamps a quantity down to the current stock", () => {
    expect(cartReducer(withItems([1, 8]), { type: "clamp", productId: 1, maxQuantity: 5 })).toEqual(withItems([1, 5]));
  });

  it("leaves quantities within stock untouched when clamping", () => {
    const state = withItems([1, 2]);
    expect(cartReducer(state, { type: "clamp", productId: 1, maxQuantity: 5 })).toBe(state);
    expect(cartReducer(state, { type: "clamp", productId: 1, maxQuantity: 0 })).toBe(state);
  });

  it("clears the cart", () => {
    expect(cartReducer(withItems([1, 2], [2, 3]), { type: "clear" })).toEqual(EMPTY_CART);
  });
});
