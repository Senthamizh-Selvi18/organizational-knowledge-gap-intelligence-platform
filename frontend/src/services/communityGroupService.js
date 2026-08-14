import axios from "axios";

const API_URL = "http://localhost:8080/api/community-groups";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getAllGroups = async () => {
  const response = await axios.get(API_URL, authHeader());
  return response.data;
};

export const getMyGroups = async () => {
  const response = await axios.get(`${API_URL}/mine`, authHeader());
  return response.data;
};

export const getGroup = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}`, authHeader());
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await axios.post(API_URL, groupData, authHeader());
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await axios.delete(`${API_URL}/${groupId}`, authHeader());
  return response.data;
};

export const joinGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/join`, {}, authHeader());
  return response.data;
};

export const leaveGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/leave`, {}, authHeader());
  return response.data;
};

export const getMembers = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}/members`, authHeader());
  return response.data;
};

export const getPosts = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}/posts`, authHeader());
  return response.data;
};

export const createPost = async (groupId, content) => {
  const response = await axios.post(
    `${API_URL}/${groupId}/posts`,
    { content },
    authHeader()
  );
  return response.data;
};

export const deletePost = async (groupId, postId) => {
  const response = await axios.delete(`${API_URL}/${groupId}/posts/${postId}`, authHeader());
  return response.data;
};

export const getEvents = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}/events`, authHeader());
  return response.data;
};

export const createEvent = async (groupId, eventData) => {
  const response = await axios.post(`${API_URL}/${groupId}/events`, eventData, authHeader());
  return response.data;
};

export const deleteEvent = async (groupId, eventId) => {
  const response = await axios.delete(`${API_URL}/${groupId}/events/${eventId}`, authHeader());
  return response.data;
};