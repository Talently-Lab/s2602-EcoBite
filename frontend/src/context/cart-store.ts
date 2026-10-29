import { create } from "zustand";
import type { CartItem } from "@/types/cart";

type AddToCartInput = Omit<CartItem, "quantity">;

type CartState = {
  items: CartItem[];
  addItem: (item: AddToCartInput, quantity?: number) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }

      return { items: [...state.items, { ...item, quantity }] };
    }),

  increase: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
      ),
    })),

  decrease: (productId) =>
    set((state) => ({
      items: state.items.flatMap((i) =>
        i.productId === productId
          ? i.quantity <= 1
            ? []
            : [{ ...i, quantity: i.quantity - 1 }]
          : [i]
      ),
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  clear: () => set({ items: [] }),
}));
