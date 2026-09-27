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

const getLocalServices = (): Service[] => {
  try {
    const raw = localStorage.getItem('greentech_local_services');
    return raw ? JSON.parse(raw) : FALLBACK_SERVICES;
  } catch {
    return FALLBACK_SERVICES;
  }
};

const saveLocalServices = (services: Service[]) => {
  try {
    localStorage.setItem('greentech_local_services', JSON.stringify(services));
  } catch {
    // ignore
  }
};

export const servicesApi = {
  // Public
  getPaginated: async (params?: ServiceFilterParams): Promise<ApiPaginatedResponse<Service>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Service>>('/services', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let filtered = getLocalServices();
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
  },

  getFeatured: async (): Promise<ApiResponse<Service[]>> => {
    try {
      const response = await api.get<ApiResponse<Service[]>>('/services/featured');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }
    return { success: true, message: 'Catalogue local', data: getLocalServices().slice(0, 4) };
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    try {
      const response = await api.get<ApiResponse<Service>>(`/services/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
    } catch {
      // ignore
    }
    const match = getLocalServices().find((s) => s.slug === slug);
    if (match) return { success: true, message: 'Catalogue local', data: match };
    throw new Error('Service introuvable');
  },

  // Admin
  getAdminList: async (params?: ServiceFilterParams): Promise<ApiPaginatedResponse<Service>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Service>>('/admin/services', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalServices();
    if (params?.category_id) {
      items = items.filter((s) => s.category_id === params.category_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (params?.is_active !== undefined) {
      items = items.filter((s) => s.is_active === params.is_active);
    }

    return {
      success: true,
      message: 'Liste locale des prestations',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  getById: async (id: number): Promise<ApiResponse<Service>> => {
    try {
      const response = await api.get<ApiResponse<Service>>(`/admin/services/${id}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }
    const match = getLocalServices().find((s) => s.id === id);
    if (match) return { success: true, message: 'Service local', data: match };
    throw new Error('Service introuvable');
  },

  create: async (data: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      const response = await api.post<ApiResponse<Service>>('/admin/services', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalServices();
    const newService: Service = {
      id: Date.now(),
      category_id: data.category_id || 1,
      title: data.title || 'Nouvelle Prestation',
      slug: (data.title || 'prestation').toLowerCase().replace(/\s+/g, '-'),
      summary: data.summary || null,
      description: data.description || '',
      icon: data.icon || 'droplet',
      image: data.image || null,
      image_url: data.image || null,
      features: data.features || [],
      display_order: current.length + 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalServices([newService, ...current]);
    return { success: true, message: 'Prestation créée avec succès.', data: newService };
  },

  update: async (id: number, data: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      const response = await api.put<ApiResponse<Service>>(`/admin/services/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalServices();
    const index = current.findIndex((s) => s.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalServices(current);
      return { success: true, message: 'Prestation mise à jour.', data: current[index] };
    }
    throw new Error('Prestation introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/services/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalServices().filter((s) => s.id !== id);
    saveLocalServices(current);
    return { success: true, message: 'Prestation supprimée.', data: null };
  },
};
