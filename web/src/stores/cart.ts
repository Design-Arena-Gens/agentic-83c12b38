import { create } from "zustand";
import { CartItem, calculateOrderTotals } from "@/lib/orders";

type CartState = {
  items: Record<string, CartItem>;
  customerName: string;
  roomNumber: string;
  phone: string;
  specialNotes: string;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateInstructions: (id: string, instructions: string) => void;
  setCustomerName: (value: string) => void;
  setRoomNumber: (value: string) => void;
  setPhone: (value: string) => void;
  setSpecialNotes: (value: string) => void;
  reset: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: {},
  customerName: "",
  roomNumber: "",
  phone: "",
  specialNotes: "",
  addItem: (item) =>
    set((state) => {
      const existing = state.items[item.id];
      const quantity = (existing?.quantity ?? 0) + item.quantity;
      return {
        items: {
          ...state.items,
          [item.id]: { ...item, quantity },
        },
      };
    }),
  removeItem: (id) =>
    set((state) => {
      const next = { ...state.items };
      delete next[id];
      return { items: next };
    }),
  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const next = { ...state.items };
        delete next[id];
        return { items: next };
      }
      return {
        items: {
          ...state.items,
          [id]: {
            ...state.items[id],
            quantity,
          },
        },
      };
    }),
  updateInstructions: (id, instructions) =>
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          ...state.items[id],
          instructions,
        },
      },
    })),
  setCustomerName: (value) => set({ customerName: value }),
  setRoomNumber: (value) => set({ roomNumber: value }),
  setPhone: (value) => set({ phone: value }),
  setSpecialNotes: (value) => set({ specialNotes: value }),
  reset: () =>
    set({
      items: {},
      customerName: "",
      roomNumber: "",
      phone: "",
      specialNotes: "",
    }),
}));

export function useCartTotals() {
  return useCartStore((state) => {
    const items = Object.values(state.items);
    const totals = calculateOrderTotals(items);
    return { items, ...totals };
  });
}
