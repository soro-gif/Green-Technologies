import api from './client';
import type { ApiResponse } from '../types/api';

export const EXPERIENCE_LEVELS = [
  { value: 'debutant', label: 'Débutant / jeune diplômé' },
  { value: '1-3', label: '1 à 3 ans' },
  { value: '3-5', label: '3 à 5 ans' },
  { value: '5-10', label: '5 à 10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
] as const;

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

export const recruitmentApi = {
  /**
   * Envoie une candidature avec ses fichiers. Pas de repli local : un CV ne peut pas être
   * conservé dans le navigateur, l'erreur doit remonter au candidat.
   */
  submit: async (data: JobApplicationDto): Promise<ApiResponse<null>> => {
    const form = new FormData();
    form.append('full_name', data.full_name);
    form.append('email', data.email);
    form.append('phone', data.phone);
    form.append('position', data.position);
    form.append('consent', data.consent ? '1' : '0');
    form.append('cv', data.cv);
    if (data.city) form.append('city', data.city);
    if (data.experience) form.append('experience', data.experience);
    if (data.linkedin) form.append('linkedin', data.linkedin);
    if (data.cover_letter) form.append('cover_letter', data.cover_letter);
    if (data.message) form.append('message', data.message);

    // Délai allongé : envoi des fichiers + réveil éventuel du serveur Render
    const response = await api.post<ApiResponse<null>>('/job-applications', form, { timeout: 90000 });
    return response.data;
  },
};
