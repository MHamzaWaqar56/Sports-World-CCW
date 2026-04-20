import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './useStore'; // 👈 auth store
import toast from 'react-hot-toast';
import { buildVariantPayload } from '../utils/productVariant';

export const useCartStore = create((set, get) => ({
  cartItems: [],

  fetchCart: async () => {
    const { userInfo } = useAuthStore.getState();
    if (!userInfo) return; // not logged in, do nothing
    try {
      const { data } = await api.get('/cart');
      
      set({ cartItems: data.products || [] });
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  },

  addToCart: async (product, quantity = 1, selectedVariant = null) => {
    const { userInfo } = useAuthStore.getState();
    if (!userInfo) {
      toast.error('User must be logged in to add to cart');
      return false;
    }
    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity,
        ...buildVariantPayload(selectedVariant),
      });
      await get().fetchCart();
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add product to cart');
      return false;
    }
  },

  removeFromCart: async (productId, variantId = null) => {
    const { userInfo } = useAuthStore.getState();
    if (!userInfo) return;
    try {
      await api.post('/cart/remove', { productId, variantId });
      await get().fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  },

  clearCart: async () => {
    const { userInfo } = useAuthStore.getState();
    if (!userInfo) return;
    try {
      await api.delete('/cart/clear');
      set({ cartItems: [] });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  },
}));