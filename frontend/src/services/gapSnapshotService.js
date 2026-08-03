import axios from "axios";

const API = "http://localhost:8080/api/gap-snapshot";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getMyGapHistory = async () => {
  return axios.get(`${API}/me/history`, authHeaders());
};

export const captureMyGapSnapshot = async () => {
  return axios.post(`${API}/me/capture`, {}, authHeaders());
};