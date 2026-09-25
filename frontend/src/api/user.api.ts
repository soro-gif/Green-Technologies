import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { QuoteRequest, ContactMessage, User } from '../types/models';
import type { CreateQuoteDto } from './quotes.api';
import type { CreateContactDto } from './contact.api';

export interface UpdateProfileDto {
  name: string;
  email: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export const userApi = {
  // User Profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/user/profile', data);
    return response.data;
  },

  // User Quotes
  getMyQuotes: async (params?: { page?: number; per_page?: number }): Promise<ApiPaginatedResponse<QuoteRequest>> => {
    const response = await api.get<ApiPaginatedResponse<QuoteRequest>>('/user/quotes', { params });
    return response.data;
  },

  getMyQuote: async (id: number): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.get<ApiResponse<QuoteRequest>>(`/user/quotes/${id}`);
    return response.data;
  },

  submitMyQuote: async (data: CreateQuoteDto): Promise<ApiResponse<QuoteRequest>> => {
    const response = await api.post<ApiResponse<QuoteRequest>>('/user/quotes', data);
    return response.data;
  },

  // User Messages
  getMyMessages: async (params?: { page?: number; per_page?: number }): Promise<ApiPaginatedResponse<ContactMessage>> => {
    const response = await api.get<ApiPaginatedResponse<ContactMessage>>('/user/messages', { params });
    return response.data;
  },

  sendMyMessage: async (data: CreateContactDto): Promise<ApiResponse<ContactMessage>> => {
    const response = await api.post<ApiResponse<ContactMessage>>('/user/messages', data);
    return response.data;
  },
};
