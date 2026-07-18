import axios from "axios";

const API_URL = "http://localhost:8080/api/external-courses";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getAllExternalCourses = async () => {

    try {

        const response = await axios.get(
            API_URL,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching external courses:",
            error
        );

        throw error;
    }
};

export const getExternalCourseById = async (id) => {

    try {

        const response = await axios.get(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching external course:",
            error
        );

        throw error;
    }
};

export const getExternalCoursesBySkill = async (skillName) => {

    try {

        const response = await axios.get(
            `${API_URL}/skill/${skillName}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching external courses by skill:",
            error
        );

        throw error;
    }
};

export const createExternalCourse = async (courseData) => {

    try {

        const response = await axios.post(
            API_URL,
            courseData,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating external course:",
            error
        );

        throw error;
    }
};

export const updateExternalCourse = async (id, courseData) => {

    try {

        const response = await axios.put(
            `${API_URL}/${id}`,
            courseData,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating external course:",
            error
        );

        throw error;
    }
};

export const deleteExternalCourse = async (id) => {

    try {

        const response = await axios.delete(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting external course:",
            error
        );

        throw error;
    }
};