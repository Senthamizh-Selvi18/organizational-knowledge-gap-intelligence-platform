import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getContacts = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/chat/contacts`);
  return response.data;
};

export const getConversation = async (otherUserId) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/chat/conversation/${otherUserId}`
  );
  return response.data;
};

export const sendMessage = async (receiverId, message) => {
  const response = await axios.post(`${API_BASE_URL}/api/chat/send`, {
    receiverId,
    message,
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/chat/unread-count`);
  return response.data.count;
};

export const markAsRead = async (otherUserId) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/chat/mark-read/${otherUserId}`
  );
  return response.data;
};

export const getConversationSummaries = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/chat/summaries`);
  return response.data;
};