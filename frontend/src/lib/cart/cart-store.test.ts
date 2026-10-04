import { describe, expect, it, vi } from "vitest";

import { CART_STORAGE_KEY, createCartStore, parseStoredCart } from "./cart-store";

const localStore = () => createCartStore(() => window.localStorage);

describe("parseStoredCart", () => {
  it.each([null, "", "not json", "42", '{"items": "nope"}'])("returns an empty cart for %j", (raw) => {
    expect(parseStoredCart(raw)).toEqual({ items: [] });
  });

  it("drops invalid and duplicate entries", () => {
    const raw = JSON.stringify({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 0 },
        { productId: -3, quantity: 1 },
        { productId: 4, quantity: 1.5 },
        { productId: "5", quantity: 1 },
        null,
        { productId: 6, quantity: 1 },
      ],
    });
    expect(parseStoredCart(raw)).toEqual({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 6, quantity: 1 },
      ],
    });
  });
});

describe("createCartStore", () => {
  it("persists changes to localStorage and notifies subscribers", () => {
    const store = localStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: "add", productId: 7, maxQuantity: 3 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({ items: [{ productId: 7, quantity: 1 }] });
  });

  it("restores the cart from localStorage (e.g. after a page refresh)", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [{ productId: 3, quantity: 2 }] }));

    expect(localStore().getSnapshot()).toEqual({ items: [{ productId: 3, quantity: 2 }] });
  });

  it("returns a stable snapshot until the state changes", () => {
    const store = localStore();
    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);

    store.dispatch({ type: "remove", productId: 1 });
    expect(store.getSnapshot()).toBe(first);
  });

  it("always renders an empty cart on the server", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [{ productId: 3, quantity: 2 }] }));
    expect(localStore().getServerSnapshot()).toEqual({ items: [] });
  });

  it("keeps working when storage throws", () => {
    const failing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    } as unknown as Storage;
    const store = createCartStore(() => failing);

    store.dispatch({ type: "add", productId: 1, maxQuantity: 2 });

    expect(store.getSnapshot()).toEqual({ items: [{ productId: 1, quantity: 1 }] });
  });

  it("syncs changes made in another tab", () => {
    const store = localStore();
    const listener = vi.fn();
    store.subscribe(listener);

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [{ productId: 9, quantity: 4 }] }));
    window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY }));

    expect(listener).toHaveBeenCalled();
    expect(store.getSnapshot()).toEqual({ items: [{ productId: 9, quantity: 4 }] });
  });
});
