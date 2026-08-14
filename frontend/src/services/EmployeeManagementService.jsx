import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api/employees";

export const getEmployees = () => {
  return axios.get(BASE_URL);
};

export const getEmployee = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

export const updateEmployee = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteEmployee = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};