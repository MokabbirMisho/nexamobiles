import { create } from 'zustand';
import api from '../services/api.js';
import { useAuthStore } from './authStore.js';

const LS_KEY = 'nexa_cart_guest';
const loadGuest = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveGuest = (items) => localStorage.setItem(LS_KEY, JSON.stringify(items));

export const useCartStore = create((set, get) => ({
  items: loadGuest(),
  loading: false,

  count: () => get().items.reduce((n, i) => n + i.quantity, 0),
  total: () =>
    get().items.reduce((sum, i) => {
      const price = Number(i.variant?.product?.price ?? i.price ?? 0);
      return sum + price * i.quantity;
    }, 0),

  // Fetch server cart when logged in
  async load() {
    if (!useAuthStore.getState().token) { set({ items: loadGuest() }); return; }
    set({ loading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data });
    } finally { set({ loading: false }); }
  },

  async add(variant, product, quantity = 1) {
    if (useAuthStore.getState().token) {
      await api.post('/cart', { productVariantId: variant.id, quantity });
      await get().load();
    } else {
      const items = [...get().items];
      const idx = items.findIndex((i) => i.productVariantId === variant.id);
      if (idx >= 0) items[idx].quantity += quantity;
      else items.push({
        id: `g-${variant.id}`, productVariantId: variant.id, quantity,
        variant: { ...variant, product },
      });
      set({ items }); saveGuest(items);
    }
  },

  async updateQty(itemId, quantity) {
    if (useAuthStore.getState().token) {
      await api.put(`/cart/${itemId}`, { quantity });
      await get().load();
    } else {
      let items = get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      items = items.filter((i) => i.quantity > 0);
      set({ items }); saveGuest(items);
    }
  },

  async remove(itemId) {
    if (useAuthStore.getState().token) {
      await api.delete(`/cart/${itemId}`);
      await get().load();
    } else {
      const items = get().items.filter((i) => i.id !== itemId);
      set({ items }); saveGuest(items);
    }
  },

  // Push guest cart to server after login, then load
  async mergeGuestCart() {
    const guest = loadGuest();
    for (const i of guest) {
      try { await api.post('/cart', { productVariantId: i.productVariantId, quantity: i.quantity }); } catch (_) {}
    }
    localStorage.removeItem(LS_KEY);
    await get().load();
  },

  clearLocal() { set({ items: [] }); localStorage.removeItem(LS_KEY); },
}));
