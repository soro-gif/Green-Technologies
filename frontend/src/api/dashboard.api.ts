import api from './client';
import type { ApiResponse } from '../types/api';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_SERVICES,
  FALLBACK_PROJECTS,
  FALLBACK_ARTICLES,
  FALLBACK_TESTIMONIALS,
  FALLBACK_USERS,
} from '../data/fallbackData';

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

const getComputedStats = (): DashboardStats => {
  let quotes: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_quotes');
    quotes = raw
      ? JSON.parse(raw)
      : [
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
        ];
  } catch {
    quotes = [];
  }

  let messages: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_messages');
    messages = raw
      ? JSON.parse(raw)
      : [
          {
            id: 1,
            full_name: 'Dr. Koné Mamadou',
            email: 'm.kone@univ-bouake.ci',
            subject: "Demande d'étude hydrogéologique pour campus",
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
        ];
  } catch {
    messages = [];
  }

  let services: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_services');
    services = raw ? JSON.parse(raw) : FALLBACK_SERVICES;
  } catch {
    services = FALLBACK_SERVICES;
  }

  let projects: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_projects');
    projects = raw ? JSON.parse(raw) : FALLBACK_PROJECTS;
  } catch {
    projects = FALLBACK_PROJECTS;
  }

  let categories: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_categories');
    categories = raw ? JSON.parse(raw) : FALLBACK_CATEGORIES;
  } catch {
    categories = FALLBACK_CATEGORIES;
  }

  let articles: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_articles');
    articles = raw ? JSON.parse(raw) : FALLBACK_ARTICLES;
  } catch {
    articles = FALLBACK_ARTICLES;
  }

  let users: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_users');
    users = raw ? JSON.parse(raw) : FALLBACK_USERS;
  } catch {
    users = FALLBACK_USERS;
  }

  let testimonials: any[] = [];
  try {
    const raw = localStorage.getItem('greentech_local_testimonials');
    testimonials = raw ? JSON.parse(raw) : FALLBACK_TESTIMONIALS;
  } catch {
    testimonials = FALLBACK_TESTIMONIALS;
  }

  const quotes_pending = quotes.filter((q) => q.status === 'pending').length;
  const quotes_in_review = quotes.filter((q) => q.status === 'in_review').length;
  const quotes_quoted = quotes.filter((q) => q.status === 'quoted').length;
  const quotes_accepted = quotes.filter((q) => q.status === 'accepted').length;
  const quotes_rejected = quotes.filter((q) => q.status === 'rejected').length;

  const messages_unread = messages.filter((m) => m.status === 'unread').length;
  const messages_read = messages.filter((m) => m.status === 'read').length;
  const messages_replied = messages.filter((m) => m.status === 'replied').length;

  return {
    overview: {
      quotes_total: quotes.length,
      quotes_pending,
      quotes_quoted,
      quotes_accepted,
      messages_total: messages.length,
      messages_unread,
      services_total: services.length,
      services_active: services.filter((s) => s.is_active !== false).length,
      projects_total: projects.length,
      projects_published: projects.filter((p) => p.status === 'published' || p.is_active !== false).length,
      articles_total: articles.length,
      articles_published: articles.filter((a) => a.status === 'published' || a.is_active !== false).length,
      categories_total: categories.length,
      testimonials_total: testimonials.length,
      users_total: users.length,
    },
    quotes_distribution: {
      pending: quotes_pending,
      in_review: quotes_in_review,
      quoted: quotes_quoted,
      accepted: quotes_accepted,
      rejected: quotes_rejected,
    },
    messages_distribution: {
      unread: messages_unread,
      read: messages_read,
      replied: messages_replied,
    },
    recent_quotes: quotes.slice(0, 5),
    recent_messages: messages.slice(0, 5),
  };
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

    const computed = getComputedStats();
    return {
      success: true,
      message: 'Statistiques calculées avec succès.',
      data: computed,
    };
  },
};
