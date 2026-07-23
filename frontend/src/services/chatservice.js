import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const chatApi = axios.create({
  baseURL: API_BASE_URL,
});

chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMe = async () => {
  const response = await chatApi.get(`/api/chat/me`);
  return response.data;
};

export const getContacts = async () => {
  const response = await chatApi.get(`/api/chat/contacts`);
  return response.data;
};

export const getSummaries = async () => {
  const response = await chatApi.get(`/api/chat/summaries`);
  return response.data;
};

export const getConversation = async (otherUserId) => {
  const response = await chatApi.get(`/api/chat/conversation/${otherUserId}`);
  return response.data;
};

export const sendMessage = async (receiverId, message) => {
  const response = await chatApi.post(`/api/chat/send`, {
    receiverId,
    message,
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await chatApi.get(`/api/chat/unread-count`);
  return response.data.count;
};

export const markAsRead = async (otherUserId) => {
  const response = await chatApi.post(`/api/chat/mark-read/${otherUserId}`);
  return response.data;
};