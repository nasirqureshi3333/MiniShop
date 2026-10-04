import { type CartAction, type CartItem, type CartState, EMPTY_CART, cartReducer } from "./cart-reducer";

export const CART_STORAGE_KEY = "mini-shop:cart";

type Listener = () => void;

export interface CartStore {
  subscribe(listener: Listener): () => void;
  getSnapshot(): CartState;
  getServerSnapshot(): CartState;
  dispatch(action: CartAction): void;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const { productId, quantity } = value as Record<string, unknown>;
  return Number.isInteger(productId) && (productId as number) > 0 && Number.isInteger(quantity) && (quantity as number) > 0;
}

export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return EMPTY_CART;
  try {
    const parsed: unknown = JSON.parse(raw);
    const items = (parsed as { items?: unknown })?.items;
    if (!Array.isArray(items)) return EMPTY_CART;
    const unique = new Map<number, CartItem>();
    for (const item of items) {
      if (isCartItem(item) && !unique.has(item.productId)) {
        unique.set(item.productId, { productId: item.productId, quantity: item.quantity });
      }
    }
    return { items: [...unique.values()] };
  } catch {
    return EMPTY_CART;
  }
}

export function createCartStore(getStorage: () => Storage | undefined): CartStore {
  let state: CartState | undefined;
  const listeners = new Set<Listener>();

  const read = (): CartState => {
    try {
      return parseStoredCart(getStorage()?.getItem(CART_STORAGE_KEY) ?? null);
    } catch {
      return EMPTY_CART;
    }
  };

  const write = (next: CartState) => {
    try {
      getStorage()?.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
    }
  };

  const emit = () => listeners.forEach((listener) => listener());

  const onStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
    state = read();
    emit();
  };

  const getSnapshot = (): CartState => {
    state ??= read();
    return state;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => EMPTY_CART,
    dispatch(action) {
      const current = getSnapshot();
      const next = cartReducer(current, action);
      if (next === current) return;
      state = next;
      write(next);
      emit();
    },
  };
}

export const cartStore = createCartStore(() => (typeof window === "undefined" ? undefined : window.localStorage));
