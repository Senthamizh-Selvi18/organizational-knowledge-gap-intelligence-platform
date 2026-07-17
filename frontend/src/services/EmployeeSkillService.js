import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getEmployees = () => {
  return axios.get(`${API_BASE_URL}/api/employees`, authHeader());
};

export const getSkills = () => {
  return axios.get(`${API_BASE_URL}/api/roles/skills/all`, authHeader());
};

export const getEmployeeSkills = (employeeId) => {
  return axios.get(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`,
    authHeader()
  );
};

export const assignSkills = (employeeId, skillIds) => {
  return axios.post(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`,
    { skillIds },
    authHeader()
  );
};

export const updateSkills = (employeeId, skillIds) => {
  return axios.put(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`,
    { skillIds },
    authHeader()
  );
};