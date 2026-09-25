import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { User, UserRole } from '../types/models';

export interface UserFilterParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const usersApi = {
  getAdminList: async (params?: UserFilterParams): Promise<ApiPaginatedResponse<User>> => {
    const response = await api.get<ApiPaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },
};
