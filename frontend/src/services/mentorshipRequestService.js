import axios from "axios";

const API_URL = "http://localhost:8080/api/mentorship-requests";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const createMentorshipRequest = async (mentorProfileId, message) => {
  try {
    const response = await axios.post(
      API_URL,
      { mentorProfileId, message },
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating mentorship request:", error);
    throw error;
  }
};

export const getIncomingRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/incoming`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    throw error;
  }
};

export const getOutgoingRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/outgoing`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching outgoing requests:", error);
    throw error;
  }
};

export const respondToRequest = async (requestId, decision, responseNote = "") => {
  try {
    const response = await axios.put(
      `${API_URL}/${requestId}/respond`,
      { decision, responseNote },
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error responding to mentorship request:", error);
    throw error;
  }
};

export const cancelRequest = async (requestId) => {
  try {
    const response = await axios.put(`${API_URL}/${requestId}/cancel`, {}, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error cancelling mentorship request:", error);
    throw error;
  }
};
