import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Article, ArticleStatus } from '../types/models';

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
    const response = await api.get<ApiPaginatedResponse<Article>>('/articles', { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Article>> => {
    const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
    return response.data;
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
