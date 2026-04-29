import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

const AUTHAPI = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

AUTHAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/accounts/register/', data);
export const loginUser = (data) => API.post('/accounts/login/', data);
export const getProfile = () => AUTHAPI.get('/accounts/profile/');
export const updateProfile = (data) => AUTHAPI.patch('/accounts/profile/update/', data);
export const uploadResume = (data) => AUTHAPI.post('/accounts/profile/upload-resume/', data);
export const extractSkills = () => AUTHAPI.post('/ai/extract-skills/');
export const getRecommendations = () => AUTHAPI.get('/ai/recommendations/');
export const rankCandidates = (jobId) => AUTHAPI.get(`/ai/rank-candidates/${jobId}/`);

export const getJobs = () => API.get('/jobs/');
export const getJob = (id) => API.get(`/jobs/${id}/`);
export const createJob = (data) => AUTHAPI.post('/jobs/create/', data);

export const applyJob = (jobId, data) => AUTHAPI.post(`/applications/apply/${jobId}/`, data);
export const getMyApplications = () => AUTHAPI.get('/applications/my-applications/');
export const getJobApplications = (jobId) => AUTHAPI.get(`/applications/job/${jobId}/`);
export const updateApplicationStatus = (id, data) => AUTHAPI.patch(`/applications/update-status/${id}/`, data);

export default AUTHAPI;