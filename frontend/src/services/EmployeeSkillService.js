import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getEmployees = () =>
  axios.get(`${BASE_URL}/employees`, authHeader());

export const getSkills = () =>
  axios.get(`${BASE_URL}/skills`, authHeader());

export const getEmployeeSkills = (employeeId) =>
  axios.get(`${BASE_URL}/employees/${employeeId}/skills`, authHeader());

export const assignSkills = (employeeId, skillIds) =>
  axios.post(
    `${BASE_URL}/employees/${employeeId}/skills`,
    { skillIds },
    authHeader()
  );

export const updateSkills = (employeeId, skillIds) =>
  axios.put(
    `${BASE_URL}/employees/${employeeId}/skills`,
    { skillIds },
    authHeader()
  );