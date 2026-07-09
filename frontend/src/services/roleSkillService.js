import axios from "axios";

const API_URL = "http://localhost:8080/api/roles";

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
