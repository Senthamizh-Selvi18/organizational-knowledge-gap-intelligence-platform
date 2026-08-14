import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api/role-skill-requirements";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getRequirementsByRole = (roleId) =>
  axios.get(`${BASE_URL}/role/${roleId}`, authHeader());

export const upsertRequirement = (roleId, skillId, requiredProficiencyLevel) =>
  axios.post(
    BASE_URL,
    { roleId, skillId, requiredProficiencyLevel },
    authHeader()
  );

export const deleteRequirement = (id) =>
  axios.delete(`${BASE_URL}/${id}`, authHeader());