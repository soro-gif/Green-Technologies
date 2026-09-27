import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { Project, ProjectStatus } from '../types/models';
import { FALLBACK_PROJECTS } from '../data/fallbackData';

export interface ProjectFilterParams {
  search?: string;
  category_id?: number;
  category_slug?: string;
  service_id?: number;
  status?: ProjectStatus;
  location?: string;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

const getLocalProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem('greentech_local_projects');
    return raw ? JSON.parse(raw) : FALLBACK_PROJECTS;
  } catch {
    return FALLBACK_PROJECTS;
  }
};

const saveLocalProjects = (projects: Project[]) => {
  try {
    localStorage.setItem('greentech_local_projects', JSON.stringify(projects));
  } catch {
    // ignore
  }
};

export const projectsApi = {
  // Public
  getPaginated: async (params?: ProjectFilterParams): Promise<ApiPaginatedResponse<Project>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Project>>('/projects', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let filtered = getLocalProjects();
    if (params?.category_id) {
      filtered = filtered.filter((p) => p.category_id === params.category_id);
    }
    if (params?.is_featured) {
      filtered = filtered.filter((p) => p.is_featured);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return {
      success: true,
      message: 'Catalogue local',
      data: filtered,
      meta: {
        current_page: 1,
        per_page: params?.per_page || 12,
        total: filtered.length,
        last_page: 1,
      },
    };
  },

  getFeatured: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await api.get<ApiResponse<Project[]>>('/projects/featured');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }
    return { success: true, message: 'Catalogue local', data: getLocalProjects().filter((p) => p.is_featured) };
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.get<ApiResponse<Project>>(`/projects/${slug}`);
      if (response.data?.data) {
        return response.data;
      }
    } catch {
      // ignore
    }
    const match = getLocalProjects().find((p) => p.slug === slug);
    if (match) return { success: true, message: 'Catalogue local', data: match };
    throw new Error('Projet introuvable');
  },

  // Admin
  getAdminList: async (params?: ProjectFilterParams): Promise<ApiPaginatedResponse<Project>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Project>>('/admin/projects', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalProjects();
    if (params?.category_id) {
      items = items.filter((p) => p.category_id === params.category_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    if (params?.status) {
      items = items.filter((p) => p.status === params.status);
    }

    return {
      success: true,
      message: 'Liste locale des réalisations',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  getById: async (id: number): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.get<ApiResponse<Project>>(`/admin/projects/${id}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }
    const match = getLocalProjects().find((p) => p.id === id);
    if (match) return { success: true, message: 'Projet local', data: match };
    throw new Error('Projet introuvable');
  },

  create: async (data: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.post<ApiResponse<Project>>('/admin/projects', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalProjects();
    const newProject: Project = {
      id: Date.now(),
      category_id: data.category_id || 1,
      service_id: data.service_id || null,
      title: data.title || 'Nouveau Chantier / Projet',
      slug: (data.title || 'projet').toLowerCase().replace(/\s+/g, '-'),
      client_name: data.client_name || null,
      location: data.location || null,
      description: data.description || '',
      results: data.results || null,
      main_image: data.main_image || data.image || '/solaire.jpg',
      image: data.image || data.main_image || '/solaire.jpg',
      image_url: data.image || data.main_image || '/solaire.jpg',
      gallery: data.gallery || [],
      status: data.status || 'published',
      budget_indicative: data.budget_indicative || null,
      completion_date: data.completion_date || null,
      is_featured: data.is_featured !== undefined ? data.is_featured : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalProjects([newProject, ...current]);
    return { success: true, message: 'Projet créé avec succès.', data: newProject };
  },

  update: async (id: number, data: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.put<ApiResponse<Project>>(`/admin/projects/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalProjects();
    const index = current.findIndex((p) => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalProjects(current);
      return { success: true, message: 'Projet mis à jour.', data: current[index] };
    }
    throw new Error('Projet introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/projects/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalProjects().filter((p) => p.id !== id);
    saveLocalProjects(current);
    return { success: true, message: 'Projet supprimé.', data: null };
  },
};
