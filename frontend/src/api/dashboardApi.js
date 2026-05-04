import api from "./axiosClient";

export const getDashboardApi = () => api.get("/dashboard");