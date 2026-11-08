import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';

export const EXPERIENCE_LEVELS = [
  { value: 'debutant', label: 'Débutant / jeune diplômé' },
  { value: '1-3', label: '1 à 3 ans' },
  { value: '3-5', label: '3 à 5 ans' },
  { value: '5-10', label: '5 à 10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
] as const;

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'reviewing', label: 'En cours d\'étude' },
  { value: 'interview', label: 'Entretien' },
  { value: 'hired', label: 'Retenue' },
  { value: 'rejected', label: 'Non retenue' },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]['value'];

export const CONTRACT_TYPES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
  { value: 'freelance', label: 'Prestataire / freelance' },
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number]['value'];

/** Offre d'emploi. Les champs de gestion ne sont renvoyés qu'à l'administration. */
export interface JobOffer {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string;
  contract_type: ContractType;
  contract_label: string;
  summary: string;
  description: string;
  requirements: string | null;
  /** AAAA-MM-JJ */
  deadline: string | null;
  published_at: string | null;
  is_published?: boolean;
  status?: 'draft' | 'published' | 'expired';
  status_label?: string;
  applications_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface JobOfferDto {
  title: string;
  department?: string;
  location: string;
  contract_type: ContractType;
  summary: string;
  description: string;
  requirements?: string;
  deadline?: string | null;
  is_published: boolean;
}

export interface JobApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  position: string;
  job_offer_id: number | null;
  /** Intitulé de l'offre à laquelle répond la candidature (null : spontanée). */
  job_offer_title?: string | null;
  experience: string | null;
  experience_label: string | null;
  linkedin: string | null;
  cv_url: string | null;
  cover_letter_url: string | null;
  message: string | null;
  status: ApplicationStatus;
  status_label: string;
  /** Présent sur la fiche détaillée (pas dans la liste). */
  internal_notes?: JobApplicationNote[];
  source: 'site' | 'admin';
  consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationNote {
  id: number;
  body: string;
  /** null : note reprise de l'ancien champ, sans auteur connu. */
  author: string | null;
  created_at: string;
  can_delete: boolean;
}

export interface JobApplicationStats {
  total: number;
  by_status: Record<ApplicationStatus, number>;
}

export interface JobApplicationDto {
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  position: string;
  job_offer_id?: number;
  experience?: string;
  linkedin?: string;
  cv: File;
  cover_letter?: File | null;
  message?: string;
  consent: boolean;
}

/** Champs saisis par l'admin (ajout manuel ou modification). */
export interface AdminJobApplicationDto {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  position?: string;
  experience?: string;
  linkedin?: string;
  cv?: File | null;
  cover_letter?: File | null;
  cv_url?: string;
  message?: string;
  status?: ApplicationStatus;
  /** À l'ajout seulement : devient la première note du journal. */
  notes?: string;
}

function toFormData(data: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    form.append(key, value instanceof File ? value : String(value));
  }
  return form;
}

// Délai allongé : envoi des fichiers + réveil éventuel du serveur Render
const UPLOAD_TIMEOUT = 90000;

export const recruitmentApi = {
  /**
   * Envoie une candidature avec ses fichiers. Pas de repli local : un CV ne peut pas être
   * conservé dans le navigateur, l'erreur doit remonter au candidat.
   */
  submit: async (data: JobApplicationDto): Promise<ApiResponse<null>> => {
    const form = toFormData({ ...data, consent: data.consent ? '1' : '0' });
    const response = await api.post<ApiResponse<null>>('/job-applications', form, { timeout: UPLOAD_TIMEOUT });
    return response.data;
  },

  // --------------------------------------------------------------- Administration

  list: async (params: { search?: string; status?: string; job_offer_id?: number; page?: number; per_page?: number }) => {
    const response = await api.get<ApiPaginatedResponse<JobApplication>>('/admin/job-applications', { params });
    return response.data;
  },

  stats: async () => {
    const response = await api.get<ApiResponse<JobApplicationStats>>('/admin/job-applications/stats');
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<ApiResponse<JobApplication>>(`/admin/job-applications/${id}`);
    return response.data;
  },

  create: async (data: AdminJobApplicationDto) => {
    const response = await api.post<ApiResponse<JobApplication>>('/admin/job-applications', toFormData({ ...data }), {
      timeout: UPLOAD_TIMEOUT,
    });
    return response.data;
  },

  /** POST multipart (fichiers possibles) : alias de mise à jour côté backend. */
  update: async (id: number, data: AdminJobApplicationDto) => {
    const response = await api.post<ApiResponse<JobApplication>>(`/admin/job-applications/${id}`, toFormData({ ...data }), {
      timeout: UPLOAD_TIMEOUT,
    });
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/job-applications/${id}`);
    return response.data;
  },

  addNote: async (id: number, body: string) => {
    const response = await api.post<ApiResponse<JobApplicationNote>>(`/admin/job-applications/${id}/notes`, { body });
    return response.data;
  },

  deleteNote: async (id: number, noteId: number) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/job-applications/${id}/notes/${noteId}`);
    return response.data;
  },

  /** Export CSV (ouvrable dans Excel) avec les filtres de la liste. */
  exportCsv: async (params: { search?: string; status?: string; job_offer_id?: number }): Promise<Blob> => {
    const response = await api.get('/admin/job-applications/export', {
      params,
      responseType: 'blob',
      timeout: UPLOAD_TIMEOUT,
    });
    return response.data;
  },
};

export const jobOffersApi = {
  /** Offres publiées et non expirées, affichées sur la page Recrutement. */
  listOpen: async () => {
    const response = await api.get<ApiResponse<JobOffer[]>>('/job-offers');
    return response.data;
  },

  // --------------------------------------------------------------- Administration

  list: async () => {
    const response = await api.get<ApiResponse<JobOffer[]>>('/admin/job-offers');
    return response.data;
  },

  create: async (data: JobOfferDto) => {
    const response = await api.post<ApiResponse<JobOffer>>('/admin/job-offers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<JobOfferDto>) => {
    const response = await api.patch<ApiResponse<JobOffer>>(`/admin/job-offers/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/job-offers/${id}`);
    return response.data;
  },
};
