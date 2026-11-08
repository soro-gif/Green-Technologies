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

export interface JobApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  position: string;
  experience: string | null;
  experience_label: string | null;
  linkedin: string | null;
  cv_url: string | null;
  cover_letter_url: string | null;
  message: string | null;
  status: ApplicationStatus;
  status_label: string;
  notes: string | null;
  source: 'site' | 'admin';
  consent_at: string | null;
  created_at: string;
  updated_at: string;
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

  list: async (params: { search?: string; status?: string; page?: number; per_page?: number }) => {
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
};
