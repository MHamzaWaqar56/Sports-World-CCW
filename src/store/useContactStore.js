
import { create } from "zustand";
import api from '../api/axios';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const useContactStore = create((set, get) => ({
  loading: false,
  success: false,
  error: null,

  messages: [],

  // 📩 SEND MESSAGE
  sendMessage: async (formData) => {
    try {
      set({ loading: true, success: false, error: null });

      await api.post('/contact', formData);

      set({
        loading: false,
        success: true,
        error: null,
      });

      return true;

    } catch (err) {
      set({
        loading: false,
        error: getErrorMessage(err, 'Failed to send message'),
        success: false,
      });

      return false;
    }
  },

  // 📥 GET ALL MESSAGES (ADMIN)
  getMessages: async () => {
    try {
      set({ loading: true, error: null });

      const { data } = await api.get('/contact/getcontacts');

      set({
        loading: false,
        messages: data.data,
      });

    } catch (err) {
      set({
        loading: false,
        error: getErrorMessage(err, 'Failed to fetch messages'),
      });
    }
  },

  // ❌ DELETE MESSAGE
  deleteMessage: async (id) => {
    try {
      await api.delete(`/contact/${id}`);

      // remove from state instantly 🔥
      set({
        messages: get().messages.filter((msg) => msg._id !== id),
      });

    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to delete message'),
      });
    }
  },

  // 🔄 RESET
  resetState: () => {
    set({
      loading: false,
      success: false,
      error: null,
    });
  },
}));