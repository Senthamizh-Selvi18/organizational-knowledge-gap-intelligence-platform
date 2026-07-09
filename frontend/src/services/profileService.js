import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
    return localStorage.getItem("token");
};

export const changePassword = async (userId, passwordData) => {

    const response = await axios.put(
        `${API_BASE_URL}/api/profile/${userId}/change-password`,
        passwordData,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;
};