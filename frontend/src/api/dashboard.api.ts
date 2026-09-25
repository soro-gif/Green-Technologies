import api from './client';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  overview: {
    quotes_total: number;
    quotes_pending: number;
    quotes_quoted: number;
    quotes_accepted: number;
    messages_total: number;
    messages_unread: number;
    services_total: number;
    services_active: number;
    projects_total: number;
    projects_published: number;
    articles_total: number;
    articles_published: number;
    categories_total: number;
    testimonials_total: number;
    users_total: number;
  };
  quotes_distribution: {
    pending: number;
    in_review: number;
    quoted: number;
    accepted: number;
    rejected: number;
  };
  messages_distribution: {
    unread: number;
    read: number;
    replied: number;
  };
  recent_quotes: Array<{
    id: number;
    reference: string;
    full_name: string;
    company?: string;
    status: string;
    estimated_budget?: number;
    created_at: string;
    category?: { name: string };
    service?: { title: string };
  }>;
  recent_messages: Array<{
    id: number;
    full_name: string;
    email: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
}

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard-stats');
    return response.data;
  },
};
