import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api';

/**
 * Resolve API Base URL intelligently:
 * 1. Uses explicit VITE_API_URL / VITE_API_BASE_URL if provided
 * 2. In production browsers, defaults to relative /api/v1 or Render backend
 * 3. In local development, defaults to http://127.0.0.1:8000/api/v1
 */
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('api_base_url');
    if (customUrl) return customUrl;
  }

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Default live Render backend API for Green Technologies
      return 'https://greentech-backend.onrender.com/api/v1';
    }
  }

  return 'http://127.0.0.1:8000/api/v1';
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request Interceptor: Attach Auth token if present & handle FormData
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    // Remove manual Content-Type for FormData so Axios sets the correct multipart boundary
    if (config.data instanceof FormData && config.headers) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Standard error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
