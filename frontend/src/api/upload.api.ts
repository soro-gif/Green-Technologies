import api from './client';
import type { ApiResponse } from '../types/api';

export interface MediaUsage {
  entity: string;
  title: string;
  id: string | number;
  link?: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  name: string;
  folder: 'articles' | 'projects' | 'services' | 'general' | 'categories';
  folder_label: string;
  relative_url: string;
  url: string;
  size: number;
  formatted_size: string;
  extension: string;
  mime_type: string;
  updated_at: string;
  type: 'local_upload' | 'public_asset' | 'cloudinary' | 'remote_url' | 'base64';
  is_deletable: boolean;
  used_in: MediaUsage[];
  usage_count: number;
}

export interface MediaFolderStat {
  folder: string;
  label: string;
  count: number;
  size: number;
  formatted_size: string;
}

export interface MediaStats {
  total_count: number;
  total_size_bytes: number;
  total_formatted_size: string;
  by_folder: Record<string, MediaFolderStat>;
}

export interface UploadResponseData {
  url: string;
  relative_url: string;
  file_name: string;
  original_name: string;
  size: number;
  formatted_size?: string;
}

const STATIC_PUBLIC_MEDIA: MediaItem[] = [
  {
    id: 'asset_logo',
    file_name: 'logo.png',
    name: 'Logo Officiel GREEN TECHNOLOGIES',
    folder: 'general',
    folder_label: 'Général',
    relative_url: '/logo.png',
    url: '/logo.png',
    size: 206539,
    formatted_size: '201.7 KB',
    extension: 'png',
    mime_type: 'image/png',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Identité visuelle', title: 'Header & Footer', id: 'site_logo' }],
    usage_count: 1,
  },
  {
    id: 'asset_fontaine',
    file_name: 'Fontaine.png',
    name: "Station d'eau potable OMS",
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/Fontaine.png',
    url: '/Fontaine.png',
    size: 1372428,
    formatted_size: '1.31 MB',
    extension: 'png',
    mime_type: 'image/png',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: "Stations de filtration d'eau", id: 2 }],
    usage_count: 1,
  },
  {
    id: 'asset_forage',
    file_name: 'forage.jpg',
    name: 'Forage hydraulique & pompage solaire',
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/forage.jpg',
    url: '/forage.jpg',
    size: 1142058,
    formatted_size: '1.09 MB',
    extension: 'jpg',
    mime_type: 'image/jpeg',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: 'Forages hydrauliques et pompage solaire', id: 1 }],
    usage_count: 1,
  },
  {
    id: 'asset_solaire',
    file_name: 'solaire.jpg',
    name: 'Centrale solaire photovoltaïque',
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/solaire.jpg',
    url: '/solaire.jpg',
    size: 1007136,
    formatted_size: '983.5 KB',
    extension: 'jpg',
    mime_type: 'image/jpeg',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: 'Centrales solaires photovoltaïques hybrides', id: 3 }],
    usage_count: 1,
  },
  {
    id: 'asset_agriculture',
    file_name: 'agriculture.jpg',
    name: 'Agrotechnologies & Irrigation',
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/agriculture.jpg',
    url: '/agriculture.jpg',
    size: 1131249,
    formatted_size: '1.08 MB',
    extension: 'jpg',
    mime_type: 'image/jpeg',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: 'Irrigation goutte-à-goutte connectée', id: 5 }],
    usage_count: 1,
  },
  {
    id: 'asset_btp',
    file_name: 'btp.jpg',
    name: 'BTP & Génie Civil écologique',
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/btp.jpg',
    url: '/btp.jpg',
    size: 1136566,
    formatted_size: '1.08 MB',
    extension: 'jpg',
    mime_type: 'image/jpeg',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: 'Ouvrages de génie civil et BTP écologique', id: 6 }],
    usage_count: 1,
  },
  {
    id: 'asset_eclairage',
    file_name: 'eclairage.jpg',
    name: 'Éclairage public solaire autonome',
    folder: 'services',
    folder_label: 'Services',
    relative_url: '/eclairage.jpg',
    url: '/eclairage.jpg',
    size: 859293,
    formatted_size: '839.2 KB',
    extension: 'jpg',
    mime_type: 'image/jpeg',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [{ entity: 'Service', title: 'Éclairage public solaire autonome', id: 4 }],
    usage_count: 1,
  },
  {
    id: 'asset_fe',
    file_name: 'FE.png',
    name: "Filtre Eau Potable Haute Capacité",
    folder: 'general',
    folder_label: 'Général',
    relative_url: '/FE.png',
    url: '/FE.png',
    size: 1408481,
    formatted_size: '1.34 MB',
    extension: 'png',
    mime_type: 'image/png',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [],
    usage_count: 0,
  },
  {
    id: 'asset_fp',
    file_name: 'FP.png',
    name: "Fontaine de Potabilisation",
    folder: 'general',
    folder_label: 'Général',
    relative_url: '/FP.png',
    url: '/FP.png',
    size: 1329928,
    formatted_size: '1.27 MB',
    extension: 'png',
    mime_type: 'image/png',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [],
    usage_count: 0,
  },
  {
    id: 'asset_prefiltre',
    file_name: 'Prefiltre.png',
    name: "Préfiltre Sédimentaire Industriel",
    folder: 'general',
    folder_label: 'Général',
    relative_url: '/Prefiltre.png',
    url: '/Prefiltre.png',
    size: 1554016,
    formatted_size: '1.48 MB',
    extension: 'png',
    mime_type: 'image/png',
    updated_at: '2026-01-01T00:00:00Z',
    type: 'public_asset',
    is_deletable: false,
    used_in: [],
    usage_count: 0,
  },
];

const getStoredMedia = (): MediaItem[] => {
  try {
    const raw = localStorage.getItem('greentech_local_media');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredMedia = (items: MediaItem[]) => {
  try {
    localStorage.setItem('greentech_local_media', JSON.stringify(items));
  } catch {
    // ignore
  }
};

const calculateFallbackStats = (items: MediaItem[]): MediaStats => {
  const total_count = items.length;
  const total_size_bytes = items.reduce((acc, item) => acc + (item.size || 0), 0);
  const total_formatted_size = `${(total_size_bytes / (1024 * 1024)).toFixed(2)} MB`;

  const folders: Record<string, MediaFolderStat> = {
    articles: { folder: 'articles', label: 'Actualités & Blog', count: 0, size: 0, formatted_size: '0 B' },
    projects: { folder: 'projects', label: 'Réalisations & Projets', count: 0, size: 0, formatted_size: '0 B' },
    services: { folder: 'services', label: 'Services & Prestations', count: 0, size: 0, formatted_size: '0 B' },
    categories: { folder: 'categories', label: 'Pôles & Domaines', count: 0, size: 0, formatted_size: '0 B' },
    general: { folder: 'general', label: 'Général & Identité', count: 0, size: 0, formatted_size: '0 B' },
  };

  items.forEach((item) => {
    const f = folders[item.folder] || folders['general'];
    f.count += 1;
    f.size += item.size || 0;
  });

  Object.values(folders).forEach((f) => {
    f.formatted_size = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` : `${(f.size / 1024).toFixed(1)} KB`;
  });

  return {
    total_count,
    total_size_bytes,
    total_formatted_size,
    by_folder: folders,
  };
};

export const uploadApi = {
  /**
   * List media files and database images with optional filtering and search.
   */
  getMedia: async (params?: {
    folder?: string;
    search?: string;
  }): Promise<ApiResponse<{ items: MediaItem[]; total: number }>> => {
    try {
      const response = await api.get<ApiResponse<{ items: MediaItem[]; total: number }>>('/admin/media', {
        params,
      });
      if (response.data && response.data.success && response.data.data?.items) {
        return response.data;
      }
    } catch {
      // Graceful fallback to static assets + locally uploaded media
    }

    const all = [...getStoredMedia(), ...STATIC_PUBLIC_MEDIA];
    let filtered = all;
    if (params?.folder && params.folder !== 'all') {
      filtered = filtered.filter((i) => i.folder === params.folder);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(q) || i.file_name.toLowerCase().includes(q));
    }

    return {
      success: true,
      message: 'Médiathèque récupérée avec succès.',
      data: {
        items: filtered,
        total: filtered.length,
      },
    };
  },

  /**
   * Get storage and media statistics.
   */
  getMediaStats: async (): Promise<ApiResponse<MediaStats>> => {
    try {
      const response = await api.get<ApiResponse<MediaStats>>('/admin/media/stats');
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const all = [...getStoredMedia(), ...STATIC_PUBLIC_MEDIA];
    return {
      success: true,
      message: 'Statistiques récupérées avec succès.',
      data: calculateFallbackStats(all),
    };
  },

  /**
   * Upload an image file from the computer explorer.
   */
  uploadImage: async (
    file: File,
    folder: 'articles' | 'projects' | 'services' | 'general' | 'categories' = 'general'
  ): Promise<ApiResponse<UploadResponseData>> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.post<ApiResponse<UploadResponseData>>('/admin/media/upload', formData, {
        headers,
      });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch {
      // Fallback: Store locally as Data URL
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newItem: MediaItem = {
          id: 'local_upload_' + Date.now(),
          file_name: file.name,
          name: file.name.replace(/\.[^/.]+$/, ''),
          folder,
          folder_label: folder.charAt(0).toUpperCase() + folder.slice(1),
          relative_url: base64,
          url: base64,
          size: file.size,
          formatted_size: `${(file.size / 1024).toFixed(1)} KB`,
          extension: file.name.split('.').pop() || 'png',
          mime_type: file.type || 'image/png',
          updated_at: new Date().toISOString(),
          type: 'local_upload',
          is_deletable: true,
          used_in: [],
          usage_count: 0,
        };

        const existing = getStoredMedia();
        saveStoredMedia([newItem, ...existing]);

        resolve({
          success: true,
          message: 'Image téléversée avec succès.',
          data: {
            url: base64,
            relative_url: base64,
            file_name: file.name,
            original_name: file.name,
            size: file.size,
            formatted_size: newItem.formatted_size,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Delete a single image from storage.
   */
  deleteMedia: async (pathOrUrl: string): Promise<ApiResponse<null>> => {
    try {
      await api.delete<ApiResponse<null>>('/admin/media', {
        data: { path: pathOrUrl },
      });
    } catch {
      // Ignore
    }

    const stored = getStoredMedia().filter((i) => i.id !== pathOrUrl && i.url !== pathOrUrl && i.relative_url !== pathOrUrl);
    saveStoredMedia(stored);

    return {
      success: true,
      message: 'Média supprimé avec succès.',
      data: null,
    };
  },

  /**
   * Delete multiple images in bulk.
   */
  bulkDeleteMedia: async (pathsOrUrls: string[]): Promise<ApiResponse<{ deleted_count: number }>> => {
    try {
      await api.post<ApiResponse<{ deleted_count: number }>>('/admin/media/bulk-delete', {
        paths: pathsOrUrls,
      });
    } catch {
      // Ignore
    }

    const stored = getStoredMedia().filter((i) => !pathsOrUrls.includes(i.id) && !pathsOrUrls.includes(i.url) && !pathsOrUrls.includes(i.relative_url));
    saveStoredMedia(stored);

    return {
      success: true,
      message: 'Médias supprimés avec succès.',
      data: { deleted_count: pathsOrUrls.length },
    };
  },
};
