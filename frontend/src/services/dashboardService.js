import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Note: JWT is already attached automatically via the global axios
// interceptor registered in authService.js — no need to add auth headers here.

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
  return response.data;
};

// CONFIRMED REAL ENDPOINT — matches EmployeeSkillController:
//   @RestController @RequestMapping("/api/employees")
//   @GetMapping("/{employeeId}/skills")
//   public ResponseEntity<List<EmployeeSkillResponseDTO>> getEmployeeSkills(...)
//
// employeeId comes from the JWT-derived localStorage "userId" (set at login,
// per the existing auth pattern used across the app).
export const getSkillsOverview = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("No userId found.");
  }

  // Get employee details using userId
  const employeeResponse = await axios.get(
    `${API_BASE_URL}/api/employees/by-user/${userId}`
  );

  const employeeId = employeeResponse.data.employeeId;

  // Fetch employee skills using employeeId
  const response = await axios.get(
    `${API_BASE_URL}/api/employees/${employeeId}/skills`
  );

  return response.data;
};
export const getTrainingProgress = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/dashboard/training-progress`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/dashboard/notifications`);
  return response.data;
};


export const getSkillGapHeatmap = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/dashboard/skill-gap-heatmap`);
  return response.data;
};

export const getCompetencyAnalytics = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("No userId found.");
  }

  // Convert logged-in userId -> employeeId
  const employeeResponse = await axios.get(
    `${API_BASE_URL}/api/employees/by-user/${userId}`
  );

  const employeeId = employeeResponse.data.employeeId;

  const response = await axios.get(
    `${API_BASE_URL}/api/dashboard/employee/${employeeId}/competency-analytics`
  );

  return response.data;
};

export const getRecentActivity = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("No userId found.");
  }

  // Convert logged-in userId -> employeeId
  const employeeResponse = await axios.get(
    `${API_BASE_URL}/api/employees/by-user/${userId}`
  );

  const employeeId = employeeResponse.data.employeeId;

  const response = await axios.get(
    `${API_BASE_URL}/api/dashboard/employee/${employeeId}/recent-activity`
  );

  return response.data;
};