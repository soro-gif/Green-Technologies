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

export const uploadApi = {
  /**
   * List media files and database images with optional filtering and search.
   */
  getMedia: async (params?: {
    folder?: string;
    search?: string;
  }): Promise<ApiResponse<{ items: MediaItem[]; total: number }>> => {
    const response = await api.get<ApiResponse<{ items: MediaItem[]; total: number }>>('/admin/media', {
      params,
    });
    return response.data;
  },

  /**
   * Get storage and media statistics.
   */
  getMediaStats: async (): Promise<ApiResponse<MediaStats>> => {
    const response = await api.get<ApiResponse<MediaStats>>('/admin/media/stats');
    return response.data;
  },

  /**
   * Upload an image file from the computer explorer.
   */
  uploadImage: async (
    file: File,
    folder: 'articles' | 'projects' | 'services' | 'general' | 'categories' = 'general'
  ): Promise<ApiResponse<UploadResponseData>> => {
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

    return response.data;
  },

  /**
   * Delete a single image from storage.
   */
  deleteMedia: async (pathOrUrl: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>('/admin/media', {
      data: { path: pathOrUrl },
    });
    return response.data;
  },

  /**
   * Delete multiple images in bulk.
   */
  bulkDeleteMedia: async (pathsOrUrls: string[]): Promise<ApiResponse<{ deleted_count: number }>> => {
    const response = await api.post<ApiResponse<{ deleted_count: number }>>('/admin/media/bulk-delete', {
      paths: pathsOrUrls,
    });
    return response.data;
  },
};

