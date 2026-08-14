import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/roles";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getRoleSkills = (roleId) => {
  return axios.get(`${API_URL}/${roleId}/skills`, authHeader());
};

export const assignSkillsToRole = (roleId, skillIds) => {
  return axios.post(
    `${API_URL}/${roleId}/skills`,
    { skillIds },
    authHeader()
  );
};

export const updateRoleSkills = (roleId, skillIds) => {
  return axios.put(
    `${API_URL}/${roleId}/skills`,
    { skillIds },
    authHeader()
  );
};
