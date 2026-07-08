import axios from "axios";

const API_URL = "http://localhost:8080/api/roles/skills/all";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getSkills = () => {
  return axios.get(API_URL, authHeader());
};
