"use client";

import { useMemo, useSyncExternalStore } from "react";

import { cartStore } from "@/lib/cart/cart-store";

const actions = {
  add: (productId: number, maxQuantity: number) => cartStore.dispatch({ type: "add", productId, maxQuantity }),
  increment: (productId: number, maxQuantity: number) =>
    cartStore.dispatch({ type: "increment", productId, maxQuantity }),
  decrement: (productId: number) => cartStore.dispatch({ type: "decrement", productId }),
  clamp: (productId: number, maxQuantity: number) => cartStore.dispatch({ type: "clamp", productId, maxQuantity }),
  remove: (productId: number) => cartStore.dispatch({ type: "remove", productId }),
  clear: () => cartStore.dispatch({ type: "clear" }),
};

export function useCart() {
  const state = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);

  return useMemo(() => {
    const quantities = new Map(state.items.map((item) => [item.productId, item.quantity]));
    return {
      items: state.items,
      getQuantity: (productId: number) => quantities.get(productId) ?? 0,
      ...actions,
    };
  }, [state]);
}

const noopSubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
