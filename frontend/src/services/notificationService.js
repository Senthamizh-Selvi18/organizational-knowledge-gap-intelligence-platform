import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const notificationApi = axios.create({
  baseURL: API_BASE_URL,
});

notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getUserId = () => localStorage.getItem("userId");

export const getRecentNotifications = async (limit = 20) => {
  const userId = getUserId();
  const response = await notificationApi.get(`/api/notifications/${userId}`, {
    params: { limit },
  });
  return response.data; // { notifications: [...], unreadCount }
};

export const getUnreadCount = async () => {
  const userId = getUserId();
  const response = await notificationApi.get(
    `/api/notifications/${userId}/unread-count`
  );
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const userId = getUserId();
  const response = await notificationApi.put(
    `/api/notifications/${userId}/${notificationId}/read`
  );
  return response.data;
};

export const markAllAsRead = async () => {
  const userId = getUserId();
  const response = await notificationApi.put(
    `/api/notifications/${userId}/read-all`
  );
  return response.data;
};
