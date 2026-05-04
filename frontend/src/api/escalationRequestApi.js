import api from "./axiosClient";

export const getEscalationsApi = (params = {}) => api.get("/escalations", { params });
export const createEscalationApi = (payload) => api.post("/escalations", payload);
export const updateEscalationApi = (id, payload) => api.patch(`/escalations/${id}`, payload);