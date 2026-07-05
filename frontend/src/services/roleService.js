import axios from "axios";

const API_URL = "http://localhost:8080/api/roles";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getRoles = () => {
  return axios.get(API_URL, authHeader());
};

export const addRole = (role) => {
  return axios.post(API_URL, role, authHeader());
};

export const updateRole = (id, role) => {
  return axios.put(`${API_URL}/${id}`, role, authHeader());
};

export const deleteRole = (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeader());
};