import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllSkills = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/skills`);
  return response.data;
};

export const recommendTeam = async (requestData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/team-builder/recommend`,
    requestData
  );
  return response.data;
};