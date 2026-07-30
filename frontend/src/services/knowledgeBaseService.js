import axios from "axios";

const API_URL = "http://localhost:8080/api/knowledge-base";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getAllArticles = async (category = "", search = "") => {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    const response = await axios.get(`${API_URL}?${params.toString()}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge base articles:", error);
    throw error;
  }
};

export const getMyArticles = async () => {
  try {
    const response = await axios.get(`${API_URL}/mine`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching my articles:", error);
    throw error;
  }
};

export const getArticle = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

export const createArticle = async (articleData) => {
  try {
    const response = await axios.post(API_URL, articleData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
};

export const updateArticle = async (id, articleData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, articleData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

export const deleteArticle = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};