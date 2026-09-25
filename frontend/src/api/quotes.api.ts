import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { QuoteRequest, QuoteStatus } from '../types/models';

export interface CreateQuoteDto {
  category_id?: number | null;
  service_id?: number | null;
  full_name: string;
  company?: string | null;
  email: string;
  phone: string;
  city: string;
  service_type?: string | null;
  estimated_budget?: number | null;
  details?: string | null;
}

export interface QuoteFilterParams {
  search?: string;
  status?: QuoteStatus;
  category_id?: number;
  service_id?: number;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface QuoteStats {
  total: number;
  pending: number;
  in_review: number;
  quoted: number;
  accepted: number;
  rejected: number;
}

export const quotesApi = {
  // Public
  submit: async (data: CreateQuoteDto): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.post<ApiResponse<QuoteRequest>>('/quotes', data);
    return response.data;
  },

  track: async (reference: string): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.get<ApiResponse<QuoteRequest>>(`/quotes/track/${reference}`);
    return response.data;
  },

  // Admin
  getAdminList: async (params?: QuoteFilterParams): Promise<ApiPaginatedResponse<QuoteRequest>> => {
    const response = await api.get<ApiPaginatedResponse<QuoteRequest>>('/admin/quotes', { params });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<QuoteStats>> => {
    const response = await api.get<ApiResponse<QuoteStats>>('/admin/quotes/stats');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.get<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, data: { status: QuoteStatus; admin_notes?: string }): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.patch<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/quotes/${id}`);
    return response.data;
  },

  exportExcel: async (): Promise<Blob> => {
    const response = await api.get('/admin/quotes/export', {
      responseType: 'blob',
    });
    return response.data;
  },
  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/admin/quotes/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};
