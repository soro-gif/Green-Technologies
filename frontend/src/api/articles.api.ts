import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Article, ArticleStatus } from '../types/models';
import { FALLBACK_ARTICLES } from '../data/fallbackData';

export interface ArticleFilterParams {
  search?: string;
  category_id?: number;
  category_slug?: string;
  user_id?: number;
  status?: ArticleStatus;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const articlesApi = {
  // Public
  getPaginated: async (params?: ArticleFilterParams): Promise<ApiPaginatedResponse<Article>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Article>>('/articles', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        success: true,
        message: 'Catalogue local',
        data: FALLBACK_ARTICLES,
        meta: {
          current_page: 1,
          per_page: params?.per_page || 12,
          total: FALLBACK_ARTICLES.length,
          last_page: 1,
        },
      };
    } catch (err) {
      console.warn('API /articles inaccessible, utilisation du catalogue local:', err);
      return {
        success: true,
        message: 'Catalogue local',
        data: FALLBACK_ARTICLES,
        meta: {
          current_page: 1,
          per_page: params?.per_page || 12,
          total: FALLBACK_ARTICLES.length,
          last_page: 1,
        },
      };
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Article>> => {
    try {
      const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
      const match = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (match) return { success: true, message: 'Catalogue local', data: match };
      throw new Error('Article introuvable');
    } catch (err) {
      const match = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (match) {
        return { success: true, message: 'Catalogue local', data: match };
      }
      throw err;
    }
  },

  // Admin
  getAdminList: async (params?: ArticleFilterParams): Promise<ApiPaginatedResponse<Article>> => {
    const response = await api.get<ApiPaginatedResponse<Article>>('/admin/articles', { params });
    return response.data;
  },

  create: async (data: Partial<Article>): Promise<ApiResponse<Article>> => {
    const response = await api.post<ApiResponse<Article>>('/admin/articles', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Article>): Promise<ApiResponse<Article>> => {
    const response = await api.put<ApiResponse<Article>>(`/admin/articles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/articles/${id}`);
    return response.data;
  },
};
