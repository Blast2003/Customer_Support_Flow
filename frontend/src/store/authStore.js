import { create } from "zustand";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || "",
  isAuthenticated: !!storedToken,

  setAuth: ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  updateUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({
      user: null,
      token: "",
      isAuthenticated: false,
    });
  },
}));