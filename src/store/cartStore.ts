import { create } from 'zustand';
import { CartEntry, MenuItem } from '../types';

interface CartStore {
  tableNumber: string;
  items: CartEntry[];
  setTableNumber: (t: string) => void;
  addItem: (item: MenuItem) => void;
  updateQty: (menuItemId: number, qty: number) => void;
  removeItem: (menuItemId: number) => void;
  reset: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableNumber: '',
  items: [],

  setTableNumber: (t) => set({ tableNumber: t }),

  addItem: (item) => {
    const existing = get().items.find((i) => i.menuItemId === item.id);
    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      set((s) => ({
        items: [
          ...s.items,
          { menuItemId: item.id, name: item.name, unit_price: item.price, quantity: 1, image_uri: item.image_uri },
        ],
      }));
    }
  },

  updateQty: (menuItemId, qty) => {
    if (qty <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i)),
    }));
  },

  removeItem: (menuItemId) =>
    set((s) => ({ items: s.items.filter((i) => i.menuItemId !== menuItemId) })),

  reset: () => set({ tableNumber: '', items: [] }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
}));
