import axios from "axios";

const API_URL = "http://localhost:8080/api/reports";

const getToken = () => {
  return localStorage.getItem("token");
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getIndividualSkillGapReport = async (employeeId) => {
  const response = await axios.get(`${API_URL}/individual-skill-gap/${employeeId}`, authHeader());
  return response.data;
};

export const getDepartmentGapSummaryReport = async () => {
  const response = await axios.get(`${API_URL}/department-gap-summary`, authHeader());
  return response.data;
};

export const getTrainingEffectivenessReport = async () => {
  const response = await axios.get(`${API_URL}/training-effectiveness`, authHeader());
  return response.data;
};

export const getLearningRoiReport = async () => {
  const response = await axios.get(`${API_URL}/learning-roi`, authHeader());
  return response.data;
};

export const getStrategicWorkforcePlanningReport = async () => {
  const response = await axios.get(`${API_URL}/strategic-workforce-planning`, authHeader());
  return response.data;
};

const downloadReportFile = async (reportType, format, employeeId) => {
  const response = await axios.get(`${API_URL}/${reportType}/export/${format}`, {
    ...authHeader(),
    params: employeeId ? { employeeId } : undefined,
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"] || "";
  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
  const fileName = fileNameMatch ? fileNameMatch[1] : `${reportType}.${format === "excel" ? "xlsx" : "pdf"}`;

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const exportReportToExcel = (reportType, employeeId) =>
  downloadReportFile(reportType, "excel", employeeId);

export const exportReportToPdf = (reportType, employeeId) =>
  downloadReportFile(reportType, "pdf", employeeId);
