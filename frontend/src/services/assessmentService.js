import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ASSESSMENTS_URL = `${API_BASE_URL}/api/assessments`;
const TEMPLATES_URL = `${API_BASE_URL}/api/assessment-templates`;

export const assignAssessment = async (payload) => {
  const response = await axios.post(`${ASSESSMENTS_URL}/assign`, payload);
  return response.data;
};

export const getMyPendingAssessments = async () => {
  const response = await axios.get(`${ASSESSMENTS_URL}/my-pending`);
  return response.data;
};

export const getAssessmentDetail = async (id) => {
  const response = await axios.get(`${ASSESSMENTS_URL}/${id}`);
  return response.data;
};

export const saveAssessmentDraft = async (id, payload) => {
  const response = await axios.put(`${ASSESSMENTS_URL}/${id}/save`, payload);
  return response.data;
};

export const submitAssessment = async (id, payload) => {
  const response = await axios.put(`${ASSESSMENTS_URL}/${id}/submit`, payload);
  return response.data;
};

export const getMyAssessmentHistory = async () => {
  const response = await axios.get(`${ASSESSMENTS_URL}/me/history`);
  return response.data;
};

export const getEmployeeAssessmentHistory = async (employeeId) => {
  const response = await axios.get(`${ASSESSMENTS_URL}/employee/${employeeId}/history`);
  return response.data;
};

export const getAssessmentsForEmployee = async (employeeId) => {
  const response = await axios.get(`${ASSESSMENTS_URL}/employee/${employeeId}`);
  return response.data;
};

export const getAssessmentTemplates = async () => {
  const response = await axios.get(TEMPLATES_URL);
  return response.data;
};

export const getAssessmentTemplateById = async (id) => {
  const response = await axios.get(`${TEMPLATES_URL}/${id}`);
  return response.data;
};

export const createAssessmentTemplate = async (payload) => {
  const response = await axios.post(TEMPLATES_URL, payload);
  return response.data;
};

export const updateAssessmentTemplate = async (id, payload) => {
  const response = await axios.put(`${TEMPLATES_URL}/${id}`, payload);
  return response.data;
};

export const deleteAssessmentTemplate = async (id) => {
  const response = await axios.delete(`${TEMPLATES_URL}/${id}`);
  return response.data;
};
