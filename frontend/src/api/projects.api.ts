import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Project, ProjectStatus } from '../types/models';
import { FALLBACK_PROJECTS } from '../data/fallbackData';

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
    try {
      const response = await api.get<ApiPaginatedResponse<Project>>('/projects', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      let filtered = [...FALLBACK_PROJECTS];
      if (params?.category_id) {
        filtered = filtered.filter((p) => p.category_id === params.category_id);
      }
      if (params?.is_featured) {
        filtered = filtered.filter((p) => p.is_featured);
      }
      return {
        success: true,
        message: 'Catalogue local',
        data: filtered,
        meta: {
          current_page: 1,
          per_page: params?.per_page || 12,
          total: filtered.length,
          last_page: 1,
        },
      };
    } catch (err) {
      console.warn('API /projects inaccessible, utilisation du catalogue local:', err);
      let filtered = [...FALLBACK_PROJECTS];
      if (params?.category_id) {
        filtered = filtered.filter((p) => p.category_id === params.category_id);
      }
      if (params?.is_featured) {
        filtered = filtered.filter((p) => p.is_featured);
      }
      return {
        success: true,
        message: 'Catalogue local',
        data: filtered,
        meta: {
          current_page: 1,
          per_page: params?.per_page || 12,
          total: filtered.length,
          last_page: 1,
        },
      };
    }
  },

  getFeatured: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await api.get<ApiResponse<Project[]>>('/projects/featured');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      return { success: true, message: 'Catalogue local', data: FALLBACK_PROJECTS.filter((p) => p.is_featured) };
    } catch (err) {
      return { success: true, message: 'Catalogue local', data: FALLBACK_PROJECTS.filter((p) => p.is_featured) };
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.get<ApiResponse<Project>>(`/projects/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
      const match = FALLBACK_PROJECTS.find((p) => p.slug === slug);
      if (match) return { success: true, message: 'Catalogue local', data: match };
      throw new Error('Projet introuvable');
    } catch (err) {
      const match = FALLBACK_PROJECTS.find((p) => p.slug === slug);
      if (match) {
        return { success: true, message: 'Catalogue local', data: match };
      }
      throw err;
    }
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
