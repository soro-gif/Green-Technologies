import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Testimonial } from '../types/models';

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

export const testimonialsApi = {
  // Public
  getPublished: async (): Promise<ApiResponse<Testimonial[]>> => {
    const response = await api.get<ApiResponse<Testimonial[]>>('/testimonials');
    return response.data;
  },

  getFeatured: async (): Promise<ApiResponse<Testimonial[]>> => {
    const response = await api.get<ApiResponse<Testimonial[]>>('/testimonials/featured');
    return response.data;
  },

  // Admin
  getAdminList: async (params?: TestimonialFilterParams): Promise<ApiPaginatedResponse<Testimonial>> => {
    const response = await api.get<ApiPaginatedResponse<Testimonial>>('/admin/testimonials', { params });
    return response.data;
  },

  create: async (data: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
    const response = await api.post<ApiResponse<Testimonial>>('/admin/testimonials', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
    const response = await api.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/testimonials/${id}`);
    return response.data;
  },
};
