import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Automatically attach JWT token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export const getRegisterableRoles = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/roles`);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });

  return response.data;
};

export const sendOtp = async (userId) => {
  const response = await axios.post(`${API_BASE_URL}/auth/otp/send`, {
    userId,
  });

  return response.data;
};

export const verifyOtp = async (userId, otp) => {
  const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
    userId,
    otp,
  });

  return response.data;
};