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

const getLocalArticles = (): Article[] => {
  try {
    const raw = localStorage.getItem('greentech_local_articles');
    return raw ? JSON.parse(raw) : FALLBACK_ARTICLES;
  } catch {
    return FALLBACK_ARTICLES;
  }
};

const saveLocalArticles = (articles: Article[]) => {
  try {
    localStorage.setItem('greentech_local_articles', JSON.stringify(articles));
  } catch {
    // ignore
  }
};

export const articlesApi = {
  // Public
  getPaginated: async (params?: ArticleFilterParams): Promise<ApiPaginatedResponse<Article>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Article>>('/articles', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let filtered = getLocalArticles();
    if (params?.category_id) {
      filtered = filtered.filter((a) => a.category_id === params.category_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(q) || (a.content && a.content.toLowerCase().includes(q)));
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
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Article>> => {
    try {
      const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
    } catch {
      // ignore
    }
    const match = getLocalArticles().find((a) => a.slug === slug);
    if (match) return { success: true, message: 'Catalogue local', data: match };
    throw new Error('Article introuvable');
  },

  // Admin
  getAdminList: async (params?: ArticleFilterParams): Promise<ApiPaginatedResponse<Article>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Article>>('/admin/articles', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalArticles();
    if (params?.category_id) {
      items = items.filter((a) => a.category_id === params.category_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(q) || (a.content && a.content.toLowerCase().includes(q)));
    }
    if (params?.status) {
      items = items.filter((a) => a.status === params.status);
    }

    return {
      success: true,
      message: 'Liste locale des articles',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  create: async (data: Partial<Article>): Promise<ApiResponse<Article>> => {
    try {
      const response = await api.post<ApiResponse<Article>>('/admin/articles', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalArticles();
    const newArticle: Article = {
      id: Date.now(),
      user_id: 1,
      category_id: data.category_id || 1,
      title: data.title || 'Nouvel Article',
      slug: (data.title || 'article').toLowerCase().replace(/\s+/g, '-'),
      excerpt: data.excerpt || null,
      content: data.content || '',
      cover_image: data.cover_image || '/Fontaine.png',
      status: data.status || 'published',
      published_at: data.published_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalArticles([newArticle, ...current]);
    return { success: true, message: 'Article créé avec succès.', data: newArticle };
  },

  update: async (id: number, data: Partial<Article>): Promise<ApiResponse<Article>> => {
    try {
      const response = await api.put<ApiResponse<Article>>(`/admin/articles/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalArticles();
    const index = current.findIndex((a) => a.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalArticles(current);
      return { success: true, message: 'Article mis à jour.', data: current[index] };
    }
    throw new Error('Article introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/articles/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalArticles().filter((a) => a.id !== id);
    saveLocalArticles(current);
    return { success: true, message: 'Article supprimé.', data: null };
  },
};
