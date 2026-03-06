import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

export const useAppStore = create()(
  persist(
    (set) => ({
      // ── Auth ────────────────────────────────────────────────────────────
      currentUser: null,
      token: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
        set({ token });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({
          currentUser: null,
          token: null,
          currentPage: "marketplace",
          interests: [],
          notifications: [],
          products: [],
        });
      },

      // ── Navigation ───────────────────────────────────────────────────────
      currentPage: "marketplace",
      setCurrentPage: (page) => set({ currentPage: page }),

      // ── Products ─────────────────────────────────────────────────────────
      products: [],
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            (p._id === id || p.id === id) ? { ...p, ...updates } : p,
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p._id !== id && p.id !== id),
        })),

      // ── Interests ────────────────────────────────────────────────────────
      interests: [],
      setInterests: (interests) => set({ interests }),
      addInterest: (interest) =>
        set((state) => ({ interests: [interest, ...state.interests] })),
      updateInterestStatus: (id, status) =>
        set((state) => ({
          interests: state.interests.map((i) =>
            i.id === id ? { ...i, status } : i,
          ),
        })),

      // ── Notifications ────────────────────────────────────────────────────
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      fetchNotifications: async () => {
        try {
          const { data } = await api.get("/notifications/my");
          set({ notifications: data });
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      },
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      markNotificationRead: async (id) => {
        try {
          await api.put("/notifications/mark-read"); // We currently mark all as read for simplicity
          set((state) => ({
            notifications: state.notifications.map((n) =>
              (n._id === id || n.id === id) ? { ...n, readStatus: true } : n,
            ),
          }));
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      },
      markAllNotificationsRead: async () => {
        try {
          await api.put("/notifications/mark-read");
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              readStatus: true,
            })),
          }));
        } catch (error) {
          console.error("Error marking all notifications as read:", error);
        }
      },

      // ── Language ─────────────────────────────────────────────────────────
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "local-connect-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        language: state.language,
        currentPage: state.currentPage,
      }),
    },
  ),
);
