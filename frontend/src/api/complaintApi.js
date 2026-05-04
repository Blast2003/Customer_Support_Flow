import api from "./axiosClient";

export const getComplaintsApi = (params = {}) => api.get("/complaints", { params });
export const createComplaintApi = (payload) => api.post("/complaints", payload);
export const updateComplaintApi = (id, payload) => api.patch(`/complaints/${id}`, payload);