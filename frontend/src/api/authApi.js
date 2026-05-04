import api from "./axiosClient";

export const authApi = {
  googleLogin: async (credential) => {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};