import api from "./axiosClient";

export const getSLAApi = (params = {}) => api.get("/sla", { params });
export const getSlaSummaryApi = () => api.get("/sla/summary");