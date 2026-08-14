import axios from "axios";

const DROPDOWN_URL = import.meta.env.VITE_API_BASE_URL + "/api/roles/skills/all";
const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/skills";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Used by Role Skill Mapping to populate the skills dropdown.
export const getSkills = () => {
  return axios.get(DROPDOWN_URL, authHeader());
};

// Skill Management CRUD (Admin only)
export const getAllSkills = () => {
  return axios.get(API_URL, authHeader());
};

export const getSkillById = (id) => {
  return axios.get(`${API_URL}/${id}`, authHeader());
};

export const addSkill = (skillName) => {
  return axios.post(API_URL, { skillName }, authHeader());
};

export const updateSkill = (id, skillName) => {
  return axios.put(`${API_URL}/${id}`, { skillName }, authHeader());
};

export const deleteSkill = (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeader());
};
