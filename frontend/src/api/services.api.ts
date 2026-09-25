import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Service } from '../types/models';

export interface ServiceFilterParams {
  search?: string;
  category_id?: number;
  category_slug?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const servicesApi = {
  // Public
  getPaginated: async (params?: ServiceFilterParams): Promise<ApiPaginatedResponse<Service>> => {
    const response = await api.get<ApiPaginatedResponse<Service>>('/services', { params });
    return response.data;
  },

  getFeatured: async (): Promise<ApiResponse<Service[]>> => {
    const response = await api.get<ApiResponse<Service[]>>('/services/featured');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    const response = await api.get<ApiResponse<Service>>(`/services/${slug}`);
    return response.data;
  },

  // Admin
  getAdminList: async (params?: ServiceFilterParams): Promise<ApiPaginatedResponse<Service>> => {
    const response = await api.get<ApiPaginatedResponse<Service>>('/admin/services', { params });
    return response.data;
  },

  create: async (data: Partial<Service>): Promise<ApiResponse<Service>> => {
    const response = await api.post<ApiResponse<Service>>('/admin/services', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Service>): Promise<ApiResponse<Service>> => {
    const response = await api.put<ApiResponse<Service>>(`/admin/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/services/${id}`);
    return response.data;
  },
};
