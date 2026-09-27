import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Service } from '../types/models';
import { FALLBACK_SERVICES } from '../data/fallbackData';

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
    try {
      const response = await api.get<ApiPaginatedResponse<Service>>('/services', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      // Fallback filtering
      let filtered = [...FALLBACK_SERVICES];
      if (params?.category_id) {
        filtered = filtered.filter((s) => s.category_id === params.category_id);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
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
      console.warn('API /services inaccessible, utilisation du catalogue local:', err);
      let filtered = [...FALLBACK_SERVICES];
      if (params?.category_id) {
        filtered = filtered.filter((s) => s.category_id === params.category_id);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
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

  getFeatured: async (): Promise<ApiResponse<Service[]>> => {
    try {
      const response = await api.get<ApiResponse<Service[]>>('/services/featured');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      return { success: true, message: 'Catalogue local', data: FALLBACK_SERVICES.slice(0, 4) };
    } catch (err) {
      return { success: true, message: 'Catalogue local', data: FALLBACK_SERVICES.slice(0, 4) };
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    try {
      const response = await api.get<ApiResponse<Service>>(`/services/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
      const match = FALLBACK_SERVICES.find((s) => s.slug === slug);
      if (match) return { success: true, message: 'Catalogue local', data: match };
      throw new Error('Service introuvable');
    } catch (err) {
      const match = FALLBACK_SERVICES.find((s) => s.slug === slug);
      if (match) {
        return { success: true, message: 'Catalogue local', data: match };
      }
      throw err;
    }
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
