
import { create } from 'zustand';
import api from '../api/axios';

export const useWishlistStore = create((set) => ({
  wishlistItems: [],

  // Fetch wishlist from backend
  fetchWishlist: async () => {
    try {
      const { data } = await api.get('/wishlist');
      set({ wishlistItems: data.products || [] });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  },

  // Toggle wishlist item (add or remove based on existence)
  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      // Backend returns updated wishlist
      set({ wishlistItems: data.wishlist.products || [] });
      return { added: data.added, removed: data.removed };
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
      return { added: false, removed: false };
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      await api.delete('/wishlist/clear');
      set({ wishlistItems: [] });
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  },
}));