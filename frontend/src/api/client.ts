import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercepteur global d'erreurs API
    if (error.response?.status === 401) {
      // Non authentifié
    }
    return Promise.reject(error);
  }
);

export default api;
