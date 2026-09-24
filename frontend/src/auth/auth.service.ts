import api from '../api/client';
import type { ApiResponse } from '../types/api';
import type { AuthResponseData, AuthUser, LoginCredentials, RegisterCredentials } from './auth.types';

export const authService = {
  /**
   * Log in user and return token + user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    const { token, user, token_type } = response.data.data;
    localStorage.setItem('auth_token', token);
    return { token, user, token_type };
  },

  /**
   * Register new user and return token + user data
   */
  async register(data: RegisterCredentials): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    const { token, user, token_type } = response.data.data;
    localStorage.setItem('auth_token', token);
    return { token, user, token_type };
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Log out user and revoke token on backend
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },
};
