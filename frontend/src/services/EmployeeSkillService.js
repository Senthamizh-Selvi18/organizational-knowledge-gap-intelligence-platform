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

// `skills` is now an array of { skillId, proficiencyLevel } objects,
// not a flat array of IDs — proficiencyLevel (0-100) is required for
// the Dashboard gap panel and Profile skill bars to show real data.
export const assignSkills = (employeeId, skills) => {
  return axios.post(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`,
    { skills },
    authHeader()
  );
};

export const updateSkills = (employeeId, skills) => {
  return axios.put(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`,
    { skills },
    authHeader()
  );
};