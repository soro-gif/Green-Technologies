import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Project, ProjectStatus } from '../types/models';

export interface ProjectFilterParams {
  search?: string;
  category_id?: number;
  category_slug?: string;
  service_id?: number;
  status?: ProjectStatus;
  location?: string;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const projectsApi = {
  // Public
  getPaginated: async (params?: ProjectFilterParams): Promise<ApiPaginatedResponse<Project>> => {
    const response = await api.get<ApiPaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  getFeatured: async (): Promise<ApiResponse<Project[]>> => {
    const response = await api.get<ApiResponse<Project[]>>('/projects/featured');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${slug}`);
    return response.data;
  },

  // Admin
  getAdminList: async (params?: ProjectFilterParams): Promise<ApiPaginatedResponse<Project>> => {
    const response = await api.get<ApiPaginatedResponse<Project>>('/admin/projects', { params });
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>('/admin/projects', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.put<ApiResponse<Project>>(`/admin/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/projects/${id}`);
    return response.data;
  },
};
