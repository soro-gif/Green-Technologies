import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Category } from '../types/models';
import { FALLBACK_CATEGORIES } from '../data/fallbackData';

const getLocalCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem('greentech_local_categories');
    return raw ? JSON.parse(raw) : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
};

const saveLocalCategories = (cats: Category[]) => {
  try {
    localStorage.setItem('greentech_local_categories', JSON.stringify(cats));
  } catch {
    // ignore
  }
};

export const categoriesApi = {
  // Public
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }
    return { success: true, message: 'Catalogue local', data: getLocalCategories() };
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    try {
      const response = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
    } catch {
      // ignore
    }
    const match = getLocalCategories().find((c) => c.slug === slug);
    if (match) return { success: true, message: 'Catalogue local', data: match };
    throw new Error('Domaine introuvable');
  },

  // Admin
  getAdminList: async (params?: { search?: string; is_active?: boolean; page?: number; per_page?: number }): Promise<ApiPaginatedResponse<Category>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Category>>('/admin/categories', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalCategories();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    }
    if (params?.is_active !== undefined) {
      items = items.filter((c) => c.is_active === params.is_active);
    }

    return {
      success: true,
      message: 'Liste locale des pôles',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  create: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const response = await api.post<ApiResponse<Category>>('/admin/categories', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalCategories();
    const newCat: Category = {
      id: Date.now(),
      name: data.name || 'Nouveau Domaine',
      slug: (data.name || 'domaine').toLowerCase().replace(/\s+/g, '-'),
      description: data.description || null,
      icon: data.icon || 'layers',
      image: data.image || null,
      image_url: data.image || null,
      display_order: current.length + 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      services_count: 0,
      projects_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newCat, ...current];
    saveLocalCategories(updated);
    return { success: true, message: 'Pôle créé avec succès.', data: newCat };
  },

  update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalCategories();
    const index = current.findIndex((c) => c.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalCategories(current);
      return { success: true, message: 'Pôle mis à jour.', data: current[index] };
    }
    throw new Error('Pôle introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/categories/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalCategories().filter((c) => c.id !== id);
    saveLocalCategories(current);
    return { success: true, message: 'Pôle supprimé.', data: null };
  },
};
