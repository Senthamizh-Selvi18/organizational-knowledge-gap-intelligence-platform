import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

export const getDepartmentHeatmap = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/gap-analysis/department-heatmap`
  );
  return response.data;
};