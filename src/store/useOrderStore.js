import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import api from '../api/axios';


const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;



export const useOrderStore = create((set, get) => ({
  orders: [],
  orderDetails: null,
  loading: false,
  error: null,
  promo: null,
  promos: [],
  promoLoading: false,
  promoError: null,

  // ✅ CREATE ORDER
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const { promo } = get();
      const { data } = await api.post('/orders', { ...orderData,
        promoCode: promo?.code || null, // include promo code if applied
      });

      set({ loading: false, promo: null }); // clear promo after order creation
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create order');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ GET MY ORDERS
  fetchMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/orders/myorders');

      set({ orders: data, loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch orders');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ GET ALL ORDERS (ADMIN / SELLER)
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/orders');

      set({ orders: data, loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch all orders');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ GET SINGLE ORDER DETAILS
  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/orders/${id}`);

      set({ orderDetails: data, loading: false });
      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch order details');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ MARK ORDER AS PAID (COD COLLECTION)
  payOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/orders/${id}/pay`);

      set({
        orderDetails: data,
        orders: get().orders.map((o) => (o._id === id ? data : o)),
        loading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update payment');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ MARK ORDER AS DELIVERED
  deliverOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/orders/${id}/deliver`);

      set({
        orderDetails: data,
        orders: get().orders.map((o) => (o._id === id ? data : o)),
        loading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to mark as delivered');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ MARK ORDER AS DISPATCHED
  dispatchOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/orders/${id}/dispatch`);

      set({
        orderDetails: data,
        orders: get().orders.map((o) => (o._id === id ? data : o)),
        loading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to mark as dispatched');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ DELETE ORDER
  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/orders/${id}`);

      set({
        orders: get().orders.filter((o) => o._id !== id),
        loading: false,
      });
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete order');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ RESET STATE (useful after logout)
  resetOrders: () => {
    set({
      orders: [],
      orderDetails: null,
      loading: false,
      error: null,
    });
  },

    // ✅ CANCEL ORDER
  cancelOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);

      set({
        orderDetails:
          get().orderDetails?._id === id ? data.order : get().orderDetails,

        orders: get().orders.map((o) =>
          o._id === id ? data.order : o
        ),

        loading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to cancel order');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ✅ SAVE CANCEL REASON (SELLER)
  saveCancelReason: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/orders/${id}/cancel-reason`, { reason });

      set({
        orderDetails:
          get().orderDetails?._id === id ? data.order : get().orderDetails,
        orders: get().orders.map((o) => (o._id === id ? data.order : o)),
        loading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to save cancel reason');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

      // ✅ VALIDATE PROMO
validatePromo: async (code) => {
  set({ promoLoading: true, promoError: null });

  try {
    const { data } = await api.post('/orders/promo/validate', { code });
    
    set({
      promo: {
        code,
        discountPercentage: data.discountPercentage,
      },
      promoLoading: false,
    });

    return data;
  } catch (error) {
    const message = getErrorMessage(error, 'Invalid promo code');

    set({
      promo: null,
      promoError: message,
      promoLoading: false,
    });

    throw new Error(message);
  }
},

createPromo: async (promoData) => {
  try {
    const { data } = await api.post('/orders/create-promo', promoData);
     set(state => ({ promos: [data, ...state.promos] }));
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create promo');
  }
},

getAllPromos: async () => {
  try {
    const { data } = await api.get('/orders/promos');
    set({ promos: data });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch promos');
  }
},

togglePromo: async (id) => {
  try {
    const { data } = await api.patch(`/orders/promo/${id}/toggle`);
    set(state => ({
      promos: state.promos.map(p => p._id === id ? data.promo : p)
    }));
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle promo');
  }
},

getPromoStats: async (id) => {
  try {
    const { data } = await api.get(`/orders/promo/${id}/stats`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stats');
  }
},

deletePromo: async (id) => {
  try {
    await api.delete(`/orders/promo/${id}`);
    set(state => ({
      promos: state.promos.filter(p => p._id !== id)
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete promo');
  }
},

deleteExpiredPromos: async () => {
  try {
    const { data } = await api.delete('/orders/promos/expired');
    set(state => ({
      promos: state.promos.filter(p =>
        !(p.expiryDate && new Date(p.expiryDate) < new Date())
      )
    }));
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete expired');
  }
},

clearPromo: () => {
  set({
    promo: null,
    promoError: null,
  });
},


}));