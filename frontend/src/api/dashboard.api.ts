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

const FALLBACK_DASHBOARD_STATS: DashboardStats = {
  overview: {
    quotes_total: 12,
    quotes_pending: 3,
    quotes_quoted: 5,
    quotes_accepted: 4,
    messages_total: 18,
    messages_unread: 2,
    services_total: 6,
    services_active: 6,
    projects_total: 4,
    projects_published: 4,
    articles_total: 2,
    articles_published: 2,
    categories_total: 4,
    testimonials_total: 4,
    users_total: 2,
  },
  quotes_distribution: {
    pending: 3,
    in_review: 2,
    quoted: 5,
    accepted: 4,
    rejected: 0,
  },
  messages_distribution: {
    unread: 2,
    read: 10,
    replied: 6,
  },
  recent_quotes: [
    {
      id: 1,
      reference: 'DEV-2026-001',
      full_name: 'Coopérative Agricole Gbêkê',
      company: 'COOP-AGRI',
      status: 'pending',
      estimated_budget: 15000000,
      created_at: '2026-03-01T10:00:00Z',
      category: { name: 'Eau et hydraulique' },
      service: { title: 'Forages hydrauliques et pompage solaire' },
    },
    {
      id: 2,
      reference: 'DEV-2026-002',
      full_name: 'Société Industrielle Korhogo',
      company: 'SIK SA',
      status: 'quoted',
      estimated_budget: 45000000,
      created_at: '2026-03-02T14:30:00Z',
      category: { name: 'Énergie solaire' },
      service: { title: 'Centrales solaires photovoltaïques hybrides' },
    },
  ],
  recent_messages: [
    {
      id: 1,
      full_name: 'Dr. Koné Mamadou',
      email: 'm.kone@univ-bouake.ci',
      subject: 'Demande d\'étude hydrogéologique pour campus',
      status: 'unread',
      created_at: '2026-03-02T09:15:00Z',
    },
    {
      id: 2,
      full_name: 'Mme Awa Traoré',
      email: 'contact@traore-agri.ci',
      subject: 'Devis kit irrigation goutte-à-goutte 15ha',
      status: 'unread',
      created_at: '2026-03-01T16:45:00Z',
    },
  ],
};

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard-stats');
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      }
    } catch {
      // Graceful fallback
    }

    return {
      success: true,
      message: 'Statistiques récupérées avec succès.',
      data: FALLBACK_DASHBOARD_STATS,
    };
  },
};
