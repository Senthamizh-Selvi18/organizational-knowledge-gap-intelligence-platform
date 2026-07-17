import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRAMEWORKS_URL = `${API_BASE_URL}/api/competency/frameworks`;
const TAXONOMY_URL = `${API_BASE_URL}/api/competency/skill-taxonomy`;
const GOALS_URL = `${API_BASE_URL}/api/competency/strategic-goals`;
const BENCHMARKS_URL = `${API_BASE_URL}/api/competency/industry-benchmarks`;

export const getFrameworks = async (roleId, department) => {
  const params = {};
  if (roleId) params.roleId = roleId;
  if (department) params.department = department;
  const response = await axios.get(FRAMEWORKS_URL, { params });
  return response.data;
};

export const getFrameworkById = async (id) => {
  const response = await axios.get(`${FRAMEWORKS_URL}/${id}`);
  return response.data;
};

export const createFramework = async (payload) => {
  const response = await axios.post(FRAMEWORKS_URL, payload);
  return response.data;
};

export const updateFramework = async (id, payload) => {
  const response = await axios.put(`${FRAMEWORKS_URL}/${id}`, payload);
  return response.data;
};

export const publishFramework = async (id) => {
  const response = await axios.patch(`${FRAMEWORKS_URL}/${id}/publish`);
  return response.data;
};

export const archiveFramework = async (id) => {
  const response = await axios.patch(`${FRAMEWORKS_URL}/${id}/archive`);
  return response.data;
};

export const deleteFramework = async (id) => {
  const response = await axios.delete(`${FRAMEWORKS_URL}/${id}`);
  return response.data;
};

export const setFrameworkSkills = async (id, skills) => {
  const response = await axios.put(`${FRAMEWORKS_URL}/${id}/skills`, { skills });
  return response.data;
};

export const addFrameworkSkill = async (id, skill) => {
  const response = await axios.post(`${FRAMEWORKS_URL}/${id}/skills`, skill);
  return response.data;
};

export const removeFrameworkSkill = async (id, frameworkSkillId) => {
  const response = await axios.delete(`${FRAMEWORKS_URL}/${id}/skills/${frameworkSkillId}`);
  return response.data;
};

export const mapFrameworkToGoal = async (id, mapping) => {
  const response = await axios.post(`${FRAMEWORKS_URL}/${id}/goals`, mapping);
  return response.data;
};

export const removeFrameworkGoalMapping = async (id, strategicGoalId) => {
  const response = await axios.delete(`${FRAMEWORKS_URL}/${id}/goals/${strategicGoalId}`);
  return response.data;
};

export const compareFrameworkToBenchmark = async (id) => {
  const response = await axios.get(`${FRAMEWORKS_URL}/${id}/benchmark-comparison`);
  return response.data;
};

export const createNewFrameworkVersion = async (id) => {
  const response = await axios.post(`${FRAMEWORKS_URL}/${id}/new-version`);
  return response.data;
};

export const getFrameworkVersionHistory = async (versionGroupId) => {
  const response = await axios.get(`${FRAMEWORKS_URL}/version-history/${versionGroupId}`);
  return response.data;
};

export const getSkillTaxonomyList = async () => {
  const response = await axios.get(TAXONOMY_URL);
  return response.data;
};

export const getSkillTaxonomyTree = async () => {
  const response = await axios.get(`${TAXONOMY_URL}/tree`);
  return response.data;
};

export const createSkillTaxonomy = async (payload) => {
  const response = await axios.post(TAXONOMY_URL, payload);
  return response.data;
};

export const updateSkillTaxonomy = async (id, payload) => {
  const response = await axios.put(`${TAXONOMY_URL}/${id}`, payload);
  return response.data;
};

export const deactivateSkillTaxonomy = async (id) => {
  const response = await axios.patch(`${TAXONOMY_URL}/${id}/deactivate`);
  return response.data;
};

export const deleteSkillTaxonomy = async (id) => {
  const response = await axios.delete(`${TAXONOMY_URL}/${id}`);
  return response.data;
};

export const getStrategicGoals = async () => {
  const response = await axios.get(GOALS_URL);
  return response.data;
};

export const createStrategicGoal = async (payload) => {
  const response = await axios.post(GOALS_URL, payload);
  return response.data;
};

export const updateStrategicGoal = async (id, payload) => {
  const response = await axios.put(`${GOALS_URL}/${id}`, payload);
  return response.data;
};

export const deleteStrategicGoal = async (id) => {
  const response = await axios.delete(`${GOALS_URL}/${id}`);
  return response.data;
};

export const getIndustryBenchmarks = async (skillTaxonomyId) => {
  const params = skillTaxonomyId ? { skillTaxonomyId } : {};
  const response = await axios.get(BENCHMARKS_URL, { params });
  return response.data;
};

export const createIndustryBenchmark = async (payload) => {
  const response = await axios.post(BENCHMARKS_URL, payload);
  return response.data;
};

export const updateIndustryBenchmark = async (id, payload) => {
  const response = await axios.put(`${BENCHMARKS_URL}/${id}`, payload);
  return response.data;
};

export const deleteIndustryBenchmark = async (id) => {
  const response = await axios.delete(`${BENCHMARKS_URL}/${id}`);
  return response.data;
};
