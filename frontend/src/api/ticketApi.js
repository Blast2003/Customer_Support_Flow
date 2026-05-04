import api from "./axiosClient";

export const getTicketsApi = (params = {}) => api.get("/tickets", { params });
export const createTicketApi = (payload) => api.post("/tickets", payload);
export const updateTicketApi = (id, payload) => api.patch(`/tickets/${id}`, payload);
export const getTicketApi = (id) => api.get(`/tickets/${id}`);
export const addTicketMessageApi = (id, payload) => api.post(`/tickets/${id}/messages`, payload);
export const resolveTicketApi = (id) => api.post(`/tickets/${id}/resolve`);
export const escalateTicketApi = (id, payload) => api.post(`/tickets/${id}/escalate`, payload);
export const markTicketReadApi = (id) => api.post(`/tickets/${id}/read`);