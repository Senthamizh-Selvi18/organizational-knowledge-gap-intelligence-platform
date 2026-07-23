import axios from "axios";

const API_URL = "http://localhost:8080/api/mentorship-sessions";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const bookSession = async (sessionData) => {
  try {
    const response = await axios.post(API_URL, sessionData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error booking session:", error);
    throw error;
  }
};

export const getMySessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};

export const getSession = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
};

export const updateSessionStatus = async (id, status, notes = "") => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}/status`,
      { status, notes },
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating session status:", error);
    throw error;
  }
};
