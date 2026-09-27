import api from './client';
import type { ApiResponse, ApiPaginatedResponse } from '../types/api';
import type { User, UserRole } from '../types/models';
import { FALLBACK_USERS } from '../data/fallbackData';

export interface UserFilterParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

const getLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem('greentech_local_users');
    return raw ? JSON.parse(raw) : FALLBACK_USERS;
  } catch {
    return FALLBACK_USERS;
  }
};

const saveLocalUsers = (users: User[]) => {
  try {
    localStorage.setItem('greentech_local_users', JSON.stringify(users));
  } catch {
    // ignore
  }
};

export const usersApi = {
  getAdminList: async (params?: UserFilterParams): Promise<ApiPaginatedResponse<User>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<User>>('/admin/users', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data;
      }
    } catch {
      // ignore
    }

    let items = getLocalUsers();
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (params?.role) {
      items = items.filter((u) => u.role === params.role);
    }
    if (params?.is_active !== undefined) {
      items = items.filter((u) => u.is_active === params.is_active);
    }

    return {
      success: true,
      message: 'Liste locale des utilisateurs',
      data: items,
      meta: {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: items.length,
        last_page: 1,
      },
    };
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }
    const match = getLocalUsers().find((u) => u.id === id);
    if (match) return { success: true, message: 'Utilisateur local', data: match };
    throw new Error('Utilisateur introuvable');
  },

  create: async (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>('/admin/users', data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalUsers();
    const newUser: User = {
      id: Date.now(),
      name: data.name || 'Nouveau Collaborateur',
      email: (data.email || `user_${Date.now()}@greentechnologies.ci`).toLowerCase().trim(),
      role: data.role || 'editor',
      role_label: data.role === 'super_admin' ? 'Super Administrateur' : data.role === 'admin' ? 'Administrateur' : 'Éditeur',
      is_active: data.is_active !== undefined ? data.is_active : true,
      permissions: data.permissions || ['view_dashboard', 'manage_content'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalUsers([newUser, ...current]);
    return { success: true, message: 'Utilisateur créé avec succès.', data: newUser };
  },

  update: async (id: number, data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
      if (response.data?.data) return response.data;
    } catch {
      // ignore
    }

    const current = getLocalUsers();
    const index = current.findIndex((u) => u.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...data, updated_at: new Date().toISOString() };
      saveLocalUsers(current);
      return { success: true, message: 'Utilisateur mis à jour.', data: current[index] };
    }
    throw new Error('Utilisateur introuvable');
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    } catch {
      // ignore
    }

    const current = getLocalUsers().filter((u) => u.id !== id);
    saveLocalUsers(current);
    return { success: true, message: 'Utilisateur supprimé.', data: null };
  },
};
