import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Note: JWT is already attached automatically via the global axios
// interceptor registered in authService.js — no need to add auth headers here.

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return response.data;
};

export const getSkillsOverview = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/skills-overview`);
  return response.data;
};

export const getCompetencyAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/competency-analytics`);
  return response.data;
};

export const getTrainingProgress = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/training-progress`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/notifications`);
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/recent-activity`);
  return response.data;
};

export const getSkillGapHeatmap = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/skill-gap-heatmap`);
  return response.data;
};