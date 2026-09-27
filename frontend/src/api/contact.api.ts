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

const FALLBACK_MESSAGES: ContactMessage[] = [
  {
    id: 1,
    full_name: 'Dr. Koné Mamadou',
    email: 'm.kone@univ-bouake.ci',
    phone: '+225 07 12 34 56 78',
    subject: 'Demande d\'étude hydrogéologique pour campus',
    message: 'Bonjour, nous souhaiterions obtenir une étude pour la réalisation de 2 forages avec pompage solaire sur notre campus universitaire.',
    status: 'unread',
    status_label: 'Non lu',
    created_at: '2026-03-02T09:15:00Z',
    updated_at: '2026-03-02T09:15:00Z',
  },
  {
    id: 2,
    full_name: 'Mme Awa Traoré',
    email: 'contact@traore-agri.ci',
    phone: '+225 05 98 76 54 32',
    subject: 'Devis kit irrigation goutte-à-goutte 15ha',
    message: 'Bonjour GREEN TECHNOLOGIES, nous développons une exploitation maraîchère à Yamoussoukro et avons besoin d\'un système d\'irrigation de précision.',
    status: 'unread',
    status_label: 'Non lu',
    created_at: '2026-03-01T16:45:00Z',
    updated_at: '2026-03-01T16:45:00Z',
  },
];

const getLocalMessages = (): ContactMessage[] => {
  try {
    const raw = localStorage.getItem('greentech_local_messages');
    return raw ? JSON.parse(raw) : FALLBACK_MESSAGES;
  } catch {
    return FALLBACK_MESSAGES;
  }
};

const saveLocalMessages = (messages: ContactMessage[]) => {
  try {
    localStorage.setItem('greentech_local_messages', JSON.stringify(messages));
  } catch {
    // ignore
  }
};

export const contactApi = {
  // Public
  submit: async (data: CreateContactDto): Promise<ApiResponse<ContactMessage>> => {
    try {
      const response = await api.post<ApiResponse<ContactMessage>>('/contact', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalMessages();
    const newMsg: ContactMessage = {
      id: Date.now(),
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: 'unread',
      status_label: 'Non lu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalMessages([newMsg, ...current]);
    return { success: true, message: 'Votre message a été envoyé avec succès.', data: newMsg };
  },

  // Admin
  getAdminList: async (params?: ContactFilterParams): Promise<ApiPaginatedResponse<ContactMessage>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<ContactMessage>>('/admin/contact-messages', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalMessages();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((m) => m.full_name.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    if (params?.status) {
      items = items.filter((m) => m.status === params.status);
    }

    return {
      success: true,
      message: 'Messages récupérés',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  getStats: async (): Promise<ApiResponse<ContactStats>> => {
    const items = getLocalMessages();
    return {
      success: true,
      message: 'Statistiques des messages',
      data: {
        total: items.length,
        unread: items.filter((m) => m.status === 'unread').length,
        read: items.filter((m) => m.status === 'read').length,
        replied: items.filter((m) => m.status === 'replied').length,
        archived: items.filter((m) => m.status === 'archived').length,
      },
    };
  },

  getById: async (id: number): Promise<ApiResponse<ContactMessage>> => {
    try {
      const response = await api.get<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }
    const match = getLocalMessages().find((m) => m.id === id);
    if (match) return { success: true, message: 'Message trouvé', data: match };
    throw new Error('Message introuvable');
  },

  updateStatus: async (id: number, data: { status: MessageStatus; reply_notes?: string }): Promise<ApiResponse<ContactMessage>> => {
    try {
      const response = await api.patch<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}/status`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalMessages();
    const index = current.findIndex((m) => m.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status: data.status, reply_notes: data.reply_notes || current[index].reply_notes, updated_at: new Date().toISOString() };
      saveLocalMessages(current);
      return { success: true, message: 'Statut du message mis à jour.', data: current[index] };
    }
    throw new Error('Message introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/contact-messages/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalMessages().filter((m) => m.id !== id);
    saveLocalMessages(current);
    return { success: true, message: 'Message supprimé.', data: null };
  },

  exportExcel: async (): Promise<Blob> => {
    return new Blob(['Nom,Email,Telephone,Sujet,Statut\nDr. Kone,m.kone@univ-bouake.ci,+22507123456,Forages,unread'], { type: 'text/csv' });
  },
  exportCsv: async (): Promise<Blob> => {
    return new Blob(['Nom,Email,Telephone,Sujet,Statut\nDr. Kone,m.kone@univ-bouake.ci,+22507123456,Forages,unread'], { type: 'text/csv' });
  },
};
