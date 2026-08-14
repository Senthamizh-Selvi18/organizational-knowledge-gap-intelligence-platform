import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/role-requests";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getAllRoleRequests = () => {
  return axios.get(API_URL, authHeader());
};

export const getPendingRoleRequests = () => {
  return axios.get(`${API_URL}/pending`, authHeader());
};

export const getPendingRoleRequestCount = () => {
  return axios.get(`${API_URL}/pending/count`, authHeader());
};

export const createRoleRequest = (data) => {
  // data: { userId, requestedRoleId, reason }
  return axios.post(API_URL, data, authHeader());
};

export const approveRoleRequest = (id) => {
  return axios.put(`${API_URL}/${id}/approve`, {}, authHeader());
};

export const rejectRoleRequest = (id) => {
  return axios.put(`${API_URL}/${id}/reject`, {}, authHeader());
};