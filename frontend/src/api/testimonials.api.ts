import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Testimonial } from '../types/models';
import { FALLBACK_TESTIMONIALS } from '../data/fallbackData';

export interface TestimonialFilterParams {
  search?: string;
  is_published?: boolean;
  is_featured?: boolean;
  rating?: number;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

const getLocalTestimonials = (): Testimonial[] => {
  try {
    const raw = localStorage.getItem('greentech_local_testimonials');
    return raw ? JSON.parse(raw) : FALLBACK_TESTIMONIALS;
  } catch {
    return FALLBACK_TESTIMONIALS;
  }
};

const saveLocalTestimonials = (items: Testimonial[]) => {
  try {
    localStorage.setItem('greentech_local_testimonials', JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const testimonialsApi = {
  // Public
  getPublished: async (): Promise<ApiResponse<Testimonial[]>> => {
    try {
      const response = await api.get<ApiResponse<Testimonial[]>>('/testimonials');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }
    return { success: true, message: 'Témoignages locaux', data: getLocalTestimonials().filter((t) => t.is_published) };
  },

  getFeatured: async (): Promise<ApiResponse<Testimonial[]>> => {
    try {
      const response = await api.get<ApiResponse<Testimonial[]>>('/testimonials/featured');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }
    return { success: true, message: 'Témoignages locaux', data: getLocalTestimonials().filter((t) => t.is_featured) };
  },

  // Admin
  getAdminList: async (params?: TestimonialFilterParams): Promise<ApiPaginatedResponse<Testimonial>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Testimonial>>('/admin/testimonials', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalTestimonials();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((t) => t.author_name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
    }
    if (params?.is_published !== undefined) {
      items = items.filter((t) => t.is_published === params.is_published);
    }

    return {
      success: true,
      message: 'Liste locale des témoignages',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  create: async (data: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
    try {
      const response = await api.post<ApiResponse<Testimonial>>('/admin/testimonials', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalTestimonials();
    const newTestimonial: Testimonial = {
      id: Date.now(),
      project_id: data.project_id || null,
      author_name: data.author_name || 'Client',
      author_role: data.author_role || 'Client Partenaire',
      company: data.company || null,
      avatar: data.avatar || null,
      content: data.content || '',
      rating: data.rating || 5,
      is_featured: data.is_featured !== undefined ? data.is_featured : true,
      is_published: data.is_published !== undefined ? data.is_published : true,
      display_order: current.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalTestimonials([newTestimonial, ...current]);
    return { success: true, message: 'Témoignage ajouté avec succès.', data: newTestimonial };
  },

  update: async (id: number, data: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
    try {
      const response = await api.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalTestimonials();
    const index = current.findIndex((t) => t.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalTestimonials(current);
      return { success: true, message: 'Témoignage mis à jour.', data: current[index] };
    }
    throw new Error('Témoignage introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/testimonials/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalTestimonials().filter((t) => t.id !== id);
    saveLocalTestimonials(current);
    return { success: true, message: 'Témoignage supprimé.', data: null };
  },
};
