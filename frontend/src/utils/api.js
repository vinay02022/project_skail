import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Use the default axios instance instead of creating a new one
// This ensures it uses the same headers set in AuthContext
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Make sure this instance inherits from the default axios headers
api.interceptors.request.use(
  (config) => {
    // Inherit authorization header from default axios instance
    if (axios.defaults.headers.common['Authorization']) {
      config.headers.Authorization = axios.defaults.headers.common['Authorization'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect on 401 - let AuthContext handle it
    return Promise.reject(error);
  }
);

// Project API functions
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (data) => api.post('/projects', data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
  getEpisodes: (projectId) => api.get(`/projects/${projectId}/episodes`),
};

// Episode API functions
export const episodeAPI = {
  create: (data) => api.post('/episodes', data),
  update: (id, data) => api.put(`/episodes/${id}`, data),
  delete: (id) => api.delete(`/episodes/${id}`),
  getById: (id) => api.get(`/episodes/${id}`),
};

// Auth API functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export default api; 