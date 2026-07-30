import axios from "axios";

const API_URL = "http://localhost:8080/api/mentors";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getAllMentors = async (expertise = "", activeOnly = true) => {
  try {
    const params = new URLSearchParams();
    if (expertise) params.append("expertise", expertise);
    params.append("activeOnly", activeOnly);
    const response = await axios.get(`${API_URL}?${params.toString()}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
};

export const getMentorProfile = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    throw error;
  }
};

export const getMyMentorProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, authHeader());
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching my mentor profile:", error);
    throw error;
  }
};

export const upsertMyMentorProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/me`, profileData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error saving mentor profile:", error);
    throw error;
  }
};

export const deleteMyMentorProfile = async () => {
  try {
    const response = await axios.delete(`${API_URL}/me`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error deleting mentor profile:", error);
    throw error;
  }
};