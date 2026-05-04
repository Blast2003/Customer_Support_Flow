import api from "./axiosClient";

export const getUsersApi = (params = {}) => api.get("/users", { params });
export const getAgentsApi = () => api.get("/users/agents");
export const updateUserApi = (id, payload) => api.patch(`/users/${id}`, payload);