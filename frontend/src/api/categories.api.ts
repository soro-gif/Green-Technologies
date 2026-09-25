import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Category } from '../types/models';

export const categoriesApi = {
  // Public
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return response.data;
  },

  // Admin
  getAdminList: async (params?: { search?: string; is_active?: boolean; page?: number; per_page?: number }): Promise<ApiPaginatedResponse<Category>> => {
    const response = await api.get<ApiPaginatedResponse<Category>>('/admin/categories', { params });
    return response.data;
  },

  create: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/admin/categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/categories/${id}`);
    return response.data;
  },
};
