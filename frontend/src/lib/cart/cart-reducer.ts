export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: "add"; productId: number; maxQuantity: number }
  | { type: "increment"; productId: number; maxQuantity: number }
  | { type: "decrement"; productId: number }
  | { type: "clamp"; productId: number; maxQuantity: number }
  | { type: "remove"; productId: number }
  | { type: "clear" };

export const EMPTY_CART: CartState = { items: [] };

function updateQuantity(state: CartState, productId: number, getQuantity: (current: number) => number): CartState {
  let changed = false;
  const items = state.items.map((item) => {
    if (item.productId !== productId) return item;
    const quantity = getQuantity(item.quantity);
    if (quantity === item.quantity) return item;
    changed = true;
    return { ...item, quantity };
  });
  return changed ? { items } : state;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      if (action.maxQuantity < 1) return state;
      const exists = state.items.some((item) => item.productId === action.productId);
      if (!exists) return { items: [...state.items, { productId: action.productId, quantity: 1 }] };
      return updateQuantity(state, action.productId, (q) => Math.min(q + 1, action.maxQuantity));
    }
    case "increment":
      return updateQuantity(state, action.productId, (q) => Math.min(q + 1, Math.max(action.maxQuantity, 1)));
    case "decrement":
      return updateQuantity(state, action.productId, (q) => Math.max(q - 1, 1));
    case "clamp":
      if (action.maxQuantity < 1) return state;
      return updateQuantity(state, action.productId, (q) => Math.min(q, action.maxQuantity));
    case "remove": {
      const items = state.items.filter((item) => item.productId !== action.productId);
      return items.length === state.items.length ? state : { items };
    }
    case "clear":
      return state.items.length === 0 ? state : EMPTY_CART;
  }
}
