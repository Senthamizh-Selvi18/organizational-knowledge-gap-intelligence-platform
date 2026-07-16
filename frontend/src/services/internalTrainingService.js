import axios from "axios";

const API_URL = "http://localhost:8080/api/internal-trainings";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getAllInternalTrainings = async () => {

    try {

        const response = await axios.get(
            API_URL,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching internal trainings:",
            error
        );

        throw error;
    }
};

export const getInternalTrainingById = async (id) => {

    try {

        const response = await axios.get(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching internal training:",
            error
        );

        throw error;
    }
};

export const getInternalTrainingsBySkill = async (skillName) => {

    try {

        const response = await axios.get(
            `${API_URL}/skill/${skillName}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching internal trainings by skill:",
            error
        );

        throw error;
    }
};

export const createInternalTraining = async (trainingData) => {

    try {

        const response = await axios.post(
            API_URL,
            trainingData,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating internal training:",
            error
        );

        throw error;
    }
};

export const updateInternalTraining = async (id, trainingData) => {

    try {

        const response = await axios.put(
            `${API_URL}/${id}`,
            trainingData,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating internal training:",
            error
        );

        throw error;
    }
};

export const deleteInternalTraining = async (id) => {

    try {

        const response = await axios.delete(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting internal training:",
            error
        );

        throw error;
    }
};
