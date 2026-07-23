import axios from "axios";

const API_URL = "http://localhost:8080/api/session-feedback";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const submitSessionFeedback = async (sessionId, rating, comments) => {
  try {
    const response = await axios.post(
      `${API_URL}/${sessionId}`,
      { rating, comments },
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const getFeedbackForSession = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/session/${sessionId}`, authHeader());
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) return null;
    console.error("Error fetching session feedback:", error);
    throw error;
  }
};

export const getFeedbackForMentor = async (mentorProfileId) => {
  try {
    const response = await axios.get(`${API_URL}/mentor/${mentorProfileId}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor feedback:", error);
    throw error;
  }
};