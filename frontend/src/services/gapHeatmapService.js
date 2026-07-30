import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const getDepartmentHeatmap = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/gap-analysis/department-heatmap`
  );
  return response.data;
};