import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

export const getRecentActivities = async (employeeId) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/employees/${employeeId}/activities`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data;
};