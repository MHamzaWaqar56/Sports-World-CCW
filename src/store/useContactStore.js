
import { create } from "zustand";

export const useContactStore = create((set, get) => ({
  loading: false,
  success: false,
  error: null,

  messages: [],

  // 📩 SEND MESSAGE
  sendMessage: async (formData) => {
    try {
      set({ loading: true, success: false, error: null });

      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      set({
        loading: false,
        success: true,
        error: null,
      });

      return true;

    } catch (err) {
      set({
        loading: false,
        error: err.message,
        success: false,
      });

      return false;
    }
  },

  // 📥 GET ALL MESSAGES (ADMIN)
  getMessages: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch("http://localhost:5000/api/contact/getcontacts");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      set({
        loading: false,
        messages: data.data,
      });

    } catch (err) {
      set({
        loading: false,
        error: err.message,
      });
    }
  },

  // 👁️ MARK AS READ
  markAsRead: async (id) => {
    try {
      await fetch(`http://localhost:5000/api/contact/${id}/read`, {
        method: "PUT",
      });

      // UI update without refetch 🔥
      set({
        messages: get().messages.map((msg) =>
          msg._id === id ? { ...msg, isRead: true } : msg
        ),
      });

    } catch (err) {
      console.error(err);
    }
  },

  // ❌ DELETE MESSAGE
  deleteMessage: async (id) => {
    try {
      await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: "DELETE",
      });

      // remove from state instantly 🔥
      set({
        messages: get().messages.filter((msg) => msg._id !== id),
      });

    } catch (err) {
      console.error(err);
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