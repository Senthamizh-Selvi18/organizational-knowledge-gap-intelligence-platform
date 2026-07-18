import axios from "axios";

const API = "http://localhost:8080/api/gap-analysis";

export const getGapAnalysis = async (employeeId) => {
  
  const token = localStorage.getItem("token");
console.log("GapAnalysis component rendered");
  return axios.get(`${API}/employee/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyGapAnalysis = async () => {
  console.log("GapAnalysis component rendered");
  const token = localStorage.getItem("token");

  return axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};