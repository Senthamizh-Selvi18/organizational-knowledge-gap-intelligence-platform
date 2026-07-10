import axios from "axios";

const API_URL = "http://localhost:8080/api/recommendation";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getRecommendation = async (employeeId) => {

    try {

        const response = await axios.get(
            `${API_URL}/${employeeId}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching recommendations:",
            error
        );

        throw error;
    }
};