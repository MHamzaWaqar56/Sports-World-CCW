
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { useWishlistStore } from './useWishlistStore';
import { useCartStore } from './useCart';
// import toast from 'react-hot-toast';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;


export const useAuthStore = create(
  persist(
    (set, get) => ({
      userInfo: null,
      loading: false,
      error: null,
      authReady: false,

      // ✅ Set user after login / OTP verify
      setUserInfo: (user) => set({ userInfo: user, authReady: true }),

      // ✅ LOGIN
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/users/auth', { email, password });

          set({
            userInfo: data,
            loading: false,
            authReady: true,
          });

          // await useWishlistStore.getState().fetchWishlist();
          try {
            await useWishlistStore.getState().fetchWishlist();
           } catch (e) {
            console.error("Wishlist fetch failed", e);
           }

          return data;
        } catch (error) {
          const message = getErrorMessage(error, 'Login failed');
          set({ error: message, loading: false, authReady: true });
          throw new Error(message);
        }
      },

      // ✅ REGISTER (OTP send only — no login here)
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/users', {
            name,
            email,
            password,
          });

          // ❌ DO NOT set userInfo here
          set({ loading: false, authReady: true });

          return {email: data.data, otpSent: true}; // frontend OTP page pe redirect karega
        } catch (error) {
          const message = getErrorMessage(error, 'Registration failed');
          set({ error: message, loading: false, authReady: true });
          throw new Error(message);
        }
      },

      // ✅ VERIFY OTP (🔥 MAIN PART)
      verifyOtp: async (email, otp) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/users/otp-verification', {
            email,
            otp,
          });

          // ✅ YAHAN login hoga
          set({
            userInfo: data.user,
            loading: false,
            authReady: true,
          });

          return data;
        } catch (error) {
          const message = getErrorMessage(error, 'OTP verification failed');
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      // ✅ FORGOT PASSWORD
forgotPassword: async (email) => {
  set({ loading: true, error: null });
  try {
    const { data } = await api.post('/users/password/forgot', { email });

    set({ loading: false });

    // frontend me toast / message dikhana
    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    const message = getErrorMessage(error, 'Forgot password failed');
    set({ error: message, loading: false });
    throw new Error(message);
  }
},

 // ✅ RESET PASSWORD
      resetPassword: async (token, password, confirmPassword) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post(
            `/users/password/reset/${token}`,
            { password, confirmPassword }
          );
          set({ loading: false });
          return data; // { success, message }
        } catch (error) {
          const message = getErrorMessage(error, 'Reset password failed');
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },


      // ✅ Sync profile (refresh / reload)
      syncProfile: async () => {
        try {
          const { data } = await api.get('/users/profile');
          set((state) => ({
            userInfo: state.userInfo
              ? { ...state.userInfo, ...data }
              : data,
            authReady: true,
            error: null,
          }));
          return data;
        } catch (error) {
          set({ userInfo: null, authReady: true });
          throw error;
        }
      },

      // ✅ hydrate
      hydrateAuth: async () => {
        set({ authReady: false });
        try {
          await get().syncProfile();
        } catch {
          set({ authReady: true });
        }
      },

      // ✅ LOGOUT
      logout: async () => {
        try {
          await api.post('/users/logout');
          useWishlistStore.setState({ wishlistItems: [] });
          useCartStore.setState({ cartItems: [] });
        } finally {
          set({ userInfo: null, error: null, authReady: true });
          localStorage.removeItem('auth-storage'); // optional cleanup
        }
      },

      clearError: () => set({ error: null }),
      markHydrated: () => set({ authReady: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ userInfo: state.userInfo }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);


export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  loading: false,
  error: null,
  productPage: 1,
  productPages: 1,
  totalProducts: 0,
  pageSize: 0,

  fetchProducts: async (options = '') => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      const requestOptions =
        typeof options === 'string'
          ? { keyword: options }
          : options && typeof options === 'object'
            ? options
            : {};

      if (requestOptions.keyword) {
        params.set('keyword', requestOptions.keyword);
      }

      if (requestOptions.page !== undefined && requestOptions.page !== null) {
        params.set('page', requestOptions.page);
      }

      if (requestOptions.limit !== undefined && requestOptions.limit !== null) {
        params.set('limit', requestOptions.limit);
      }

      const query = params.toString();
      const { data } = await api.get(`/products${query ? `?${query}` : ''}`);
      set({
        products: data.products || [],
        productPage: data.page || 1,
        productPages: data.pages || 1,
        totalProducts: data.totalProducts || (data.products || []).length,
        pageSize: data.limit || (data.products || []).length,
        loading: false,
      });
      return data.products || [];
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch products');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/products/featured');
      set({ products: data || [], loading: false });
      return data || [];
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch featured products');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null, product: null });
    try {
      const { data } = await api.get(`/products/${id}`);
      set({ product: data, loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch product');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/products', productData);
      set({ products: [data, ...get().products], loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create product');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/products/${id}`, productData);
      set({
        products: get().products.map((p) => (p._id === id ? data : p)),
        product: data,
        loading: false,
      });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update product');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },


  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/products/${id}`);
      set({ products: get().products.filter((p) => p._id !== id), loading: false });
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete product');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  }
}));
