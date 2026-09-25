import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { ContactMessage, MessageStatus } from '../types/models';

export interface CreateContactDto {
  full_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export interface ContactFilterParams {
  search?: string;
  status?: MessageStatus;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}

export const contactApi = {
  // Public
  submit: async (data: CreateContactDto): Promise<ApiResponse<ContactMessage>> => {
    const response = await api.post<ApiResponse<ContactMessage>>('/contact', data);
    return response.data;
  },

  // Admin
  getAdminList: async (params?: ContactFilterParams): Promise<ApiPaginatedResponse<ContactMessage>> => {
    const response = await api.get<ApiPaginatedResponse<ContactMessage>>('/admin/contact-messages', { params });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<ContactStats>> => {
    const response = await api.get<ApiResponse<ContactStats>>('/admin/contact-messages/stats');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ContactMessage>> => {
    const response = await api.get<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, data: { status: MessageStatus; reply_notes?: string }): Promise<ApiResponse<ContactMessage>> => {
    const response = await api.patch<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/contact-messages/${id}`);
    return response.data;
  },

  exportExcel: async (): Promise<Blob> => {
    const response = await api.get('/admin/contact-messages/export', {
      responseType: 'blob',
    });
    return response.data;
  },
  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/admin/contact-messages/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};
