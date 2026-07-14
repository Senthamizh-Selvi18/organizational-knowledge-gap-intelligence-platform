import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get All Courses
export const getCourses = async () => {
  const response = await axios.get(`${API_BASE_URL}/courses`);
  return response.data;
};