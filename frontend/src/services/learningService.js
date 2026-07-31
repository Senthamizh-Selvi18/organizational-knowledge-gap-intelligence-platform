import axios from "axios";

const API_URL = "http://localhost:8080/api/learning";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// NOTE: these four "read" functions return the RAW axios response
// (not response.data), to match how LearningProgress.jsx and
// EmployeeDashboard.jsx already consume them (they call response.data
// themselves).
export const getEmployeeLearning = async (employeeId) => {

    try {

        const response = await axios.get(
            `${API_URL}/employee/${employeeId}`,
            authHeader()
        );

        return response;

    } catch (error) {

        console.error(
            "Error fetching employee learning:",
            error
        );

        throw error;
    }
};

export const getEnrolledTrainingIds = async (employeeId) => {

    try {

        const response = await axios.get(
            `${API_URL}/employee/${employeeId}/training-ids`,
            authHeader()
        );

        return response;

    } catch (error) {

        console.error(
            "Error fetching enrolled training ids:",
            error
        );

        throw error;
    }
};

export const getAllEnrollments = async () => {

    try {

        const response = await axios.get(
            `${API_URL}/admin/enrollments`,
            authHeader()
        );

        return response;

    } catch (error) {

        console.error(
            "Error fetching all enrollments:",
            error
        );

        throw error;
    }
};

export const getLearningDashboard = async (employeeId) => {

    try {

        const response = await axios.get(
            `${API_URL}/dashboard/${employeeId}`,
            authHeader()
        );

        return response;

    } catch (error) {

        console.error(
            "Error fetching learning dashboard:",
            error
        );

        throw error;
    }
};

// Mutations return response.data (unwrapped) - nothing depends on the raw response for these.
export const enroll = async (employeeId, trainingId) => {

    try {

        const response = await axios.post(
            `${API_URL}/enroll`,
            null,
            {
                ...authHeader(),
                params: { employeeId, trainingId },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error enrolling in training:",
            error
        );

        throw error;
    }
};

export const startTraining = async (enrollmentId) => {

    try {

        const response = await axios.put(
            `${API_URL}/${enrollmentId}/start`,
            {},
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error starting training:",
            error
        );

        throw error;
    }
};

export const updateProgress = async (enrollmentId, progress) => {

    try {

        const response = await axios.put(
            `${API_URL}/${enrollmentId}/progress`,
            { progress },
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating progress:",
            error
        );

        throw error;
    }
};

export const completeTraining = async (enrollmentId) => {

    try {

        const response = await axios.put(
            `${API_URL}/${enrollmentId}/complete`,
            {},
            authHeader()
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error completing training:",
            error
        );

        throw error;
    }
};