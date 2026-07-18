import axios from "axios";

const API_BASE = "http://localhost:8080/api/certifications";

function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
  };
}

export const getCertifications = (employeeId) =>
  axios.get(`${API_BASE}/${employeeId}`, authHeaders());

export const uploadCertification = (employeeId, formData) =>
  axios.post(`${API_BASE}/${employeeId}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteCertification = (employeeId, certificationId) =>
  axios.delete(`${API_BASE}/${employeeId}/${certificationId}`, authHeaders());