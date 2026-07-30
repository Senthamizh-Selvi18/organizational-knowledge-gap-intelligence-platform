import axios from "axios";

const API_URL = "http://localhost:8080/api/learning";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Enroll in Training
export const enroll = (employeeId, trainingId) => {
    return axios.post(
        `${API_URL}/enroll?employeeId=${employeeId}&trainingId=${trainingId}`,
        {},
        authHeader()
    );
};

// My Learning
export const getEmployeeLearning = (employeeId) => {
    return axios.get(
        `${API_URL}/employee/${employeeId}`,
        authHeader()
    );
};
export const getEnrolledTrainingIds = (employeeId) => {
    return axios.get(
        `${API_URL}/employee/${employeeId}/training-ids`,
        authHeader()
    );
};
// Update Progress
export const updateProgress = (enrollmentId, progress) => {
    return axios.put(
        `${API_URL}/${enrollmentId}/progress`,
        { progress },
        authHeader()
    );
};

// Mark Training as Completed
export const completeTraining = (enrollmentId) => {
    return axios.put(
        `${API_URL}/${enrollmentId}/complete`,
        {},
        authHeader()
    );
};
// Dashboard
export const getLearningDashboard = (employeeId) => {
    return axios.get(
        `${API_URL}/dashboard/${employeeId}`,
        authHeader()
    );
};
export const getAllEnrollments = () => {
    return axios.get(
        `${API_URL}/admin/enrollments`,
        authHeader()
    );
};