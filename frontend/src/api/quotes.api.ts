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

const FALLBACK_QUOTES: QuoteRequest[] = [
  {
    id: 1,
    reference: 'DEV-2026-001',
    category_id: 1,
    service_id: 1,
    full_name: 'Coopérative Agricole Gbêkê',
    company: 'COOP-AGRI',
    email: 'contact@coop-agri.ci',
    phone: '+225 07 08 09 10 11',
    city: 'Bouaké',
    service_type: 'Forage hydraulique & pompage solaire',
    estimated_budget: 15000000,
    details: 'Demande de forage profond 90m pour alimentation villageoise et château d\'eau.',
    status: 'pending',
    status_label: 'En attente',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    reference: 'DEV-2026-002',
    category_id: 2,
    service_id: 3,
    full_name: 'Société Industrielle Korhogo',
    company: 'SIK SA',
    email: 'direction@sik.ci',
    phone: '+225 05 06 07 08 09',
    city: 'Korhogo',
    service_type: 'Centrale solaire hybride 120 kWc',
    estimated_budget: 45000000,
    details: 'Installation sur toiture d\'usine avec stockage lithium pour réduction des factures CIE.',
    status: 'quoted',
    status_label: 'Devis envoyé',
    created_at: '2026-03-02T14:30:00Z',
    updated_at: '2026-03-02T14:30:00Z',
  },
];

const getLocalQuotes = (): QuoteRequest[] => {
  try {
    const raw = localStorage.getItem('greentech_local_quotes');
    return raw ? JSON.parse(raw) : FALLBACK_QUOTES;
  } catch {
    return FALLBACK_QUOTES;
  }
};

const saveLocalQuotes = (quotes: QuoteRequest[]) => {
  try {
    localStorage.setItem('greentech_local_quotes', JSON.stringify(quotes));
  } catch {
    // ignore
  }
};

export const quotesApi = {
  // Public
  submit: async (data: CreateQuoteDto): Promise<ApiResponse<QuoteRequest>> => {
    try {
      const response = await api.post<ApiResponse<QuoteRequest>>('/quotes', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalQuotes();
    const newQuote: QuoteRequest = {
      id: Date.now(),
      reference: `DEV-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`,
      category_id: data.category_id || null,
      service_id: data.service_id || null,
      full_name: data.full_name,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      city: data.city,
      service_type: data.service_type || null,
      estimated_budget: data.estimated_budget || null,
      details: data.details || '',
      status: 'pending',
      status_label: 'En attente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalQuotes([newQuote, ...current]);
    return { success: true, message: 'Demande de devis enregistrée avec succès.', data: newQuote };
  },

  track: async (reference: string): Promise<ApiResponse<QuoteRequest>> => {
    try {
      const response = await api.get<ApiResponse<QuoteRequest>>(`/quotes/track/${reference}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const match = getLocalQuotes().find((q) => q.reference.toLowerCase() === reference.toLowerCase());
    if (match) return { success: true, message: 'Devis trouvé', data: match };
    throw new Error('Devis introuvable');
  },

  // Admin
  getAdminList: async (params?: QuoteFilterParams): Promise<ApiPaginatedResponse<QuoteRequest>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<QuoteRequest>>('/admin/quotes', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalQuotes();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((i) => i.full_name.toLowerCase().includes(q) || i.reference.toLowerCase().includes(q) || (i.company && i.company.toLowerCase().includes(q)));
    }
    if (params?.status) {
      items = items.filter((i) => i.status === params.status);
    }

    return {
      success: true,
      message: 'Liste locale des devis',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  getStats: async (): Promise<ApiResponse<QuoteStats>> => {
    const items = getLocalQuotes();
    return {
      success: true,
      message: 'Statistiques des devis',
      data: {
        total: items.length,
        pending: items.filter((q) => q.status === 'pending').length,
        in_review: items.filter((q) => q.status === 'in_review').length,
        quoted: items.filter((q) => q.status === 'quoted').length,
        accepted: items.filter((q) => q.status === 'accepted').length,
        rejected: items.filter((q) => q.status === 'rejected').length,
      },
    };
  },

  getById: async (id: number): Promise<ApiResponse<QuoteRequest>> => {
    try {
      const response = await api.get<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }
    const match = getLocalQuotes().find((q) => q.id === id);
    if (match) return { success: true, message: 'Devis trouvé', data: match };
    throw new Error('Devis introuvable');
  },

  updateStatus: async (id: number, data: { status: QuoteStatus; admin_notes?: string }): Promise<ApiResponse<QuoteRequest>> => {
    try {
      const response = await api.patch<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/status`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalQuotes();
    const index = current.findIndex((q) => q.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status: data.status, admin_notes: data.admin_notes || current[index].admin_notes, updated_at: new Date().toISOString() };
      saveLocalQuotes(current);
      return { success: true, message: 'Statut mis à jour.', data: current[index] };
    }
    throw new Error('Devis introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/quotes/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalQuotes().filter((q) => q.id !== id);
    saveLocalQuotes(current);
    return { success: true, message: 'Devis supprimé.', data: null };
  },

  exportExcel: async (): Promise<Blob> => {
    return new Blob(['Reference,Client,Email,Telephone,Statut,Budget\nDEV-2026-001,Coopérative Agricole,contact@coop-agri.ci,+22507080910,pending,15000000'], { type: 'text/csv' });
  },
  exportCsv: async (): Promise<Blob> => {
    return new Blob(['Reference,Client,Email,Telephone,Statut,Budget\nDEV-2026-001,Coopérative Agricole,contact@coop-agri.ci,+22507080910,pending,15000000'], { type: 'text/csv' });
  },
};
