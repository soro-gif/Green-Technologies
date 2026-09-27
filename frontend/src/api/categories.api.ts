import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Category } from '../types/models';
import { FALLBACK_CATEGORIES } from '../data/fallbackData';

export const categoriesApi = {
  // Public
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      return { success: true, message: 'Fallback local', data: FALLBACK_CATEGORIES };
    } catch (err) {
      console.warn('API /categories inaccessible, utilisation du catalogue local:', err);
      return { success: true, message: 'Catalogue local', data: FALLBACK_CATEGORIES };
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    try {
      const response = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
      const match = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
      if (match) return { success: true, message: 'Catalogue local', data: match };
      throw new Error('Domaine introuvable');
    } catch (err) {
      console.warn(`API /categories/${slug} inaccessible, recherche dans le catalogue local:`, err);
      const match = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
      if (match) {
        return { success: true, message: 'Catalogue local', data: match };
      }
      throw err;
    }
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
