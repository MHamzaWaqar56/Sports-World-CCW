import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from '../api/axios';

export const useReviewStore = create((set) => ({
  reviews: [],
  loading: false,
  error: null,
  topReviews: [],
  topReviewsLoading: false,

  // ✅ Get reviews (from product)
  fetchReviews: async (productId) => {
    set({ loading: true, error: null });

    try {
      const { data } = await api.get(`/products/${productId}`);

      set({
        reviews: data.reviews || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch reviews',
        loading: false,
      });
    }
  },

  // Get top reviews across all products
fetchTopReviews: async (limit = 5) => {
  set({ topReviewsLoading: true });
  try {
    const { data } = await api.get(`/products/top-reviews?limit=${limit}`);
    set({ topReviews: data, topReviewsLoading: false });
  } catch (error) {
    set({error: error.response?.data?.message || 'Failed to fetch reviews', topReviewsLoading: false });
  }
},

  // ✅ Add review
  addReview: async (productId, reviewData) => {
    set({ loading: true });

    try {
      await api.post(`/products/${productId}/reviews`, reviewData);

      toast.success('Review added successfully');

      // 🔄 refresh reviews after adding
      const { data } = await api.get(`/products/${productId}`);

      set({
        reviews: data.reviews || [],
        loading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
      set({ loading: false });
    }
  },

  // ✅ Clear reviews (optional)
  clearReviews: () => set({ reviews: [] }),

  deleteReview: async (productId, reviewId) => {
  await api.delete(`/products/${productId}/reviews/${reviewId}`);
},

updateReview: async (productId, reviewId, data) => {
  await api.put(`/products/${productId}/reviews/${reviewId}`, data);
},

}));

