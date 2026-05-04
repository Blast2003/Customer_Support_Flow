import api from "./axiosClient";
export const getCustomersApi = () => api.get("/customers");
