import api from './client';
import type { ApiResponse } from '../types/api';

export interface UploadResponseData {
  url: string;
  relative_url: string;
  file_name: string;
  original_name: string;
  size: number;
}

export const uploadApi = {
  /**
   * Upload an image file from the computer explorer.
   */
  uploadImage: async (
    file: File,
    folder: 'articles' | 'projects' | 'services' | 'general' = 'articles'
  ): Promise<ApiResponse<UploadResponseData>> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await api.post<ApiResponse<UploadResponseData>>('/admin/upload', formData, {
      headers,
    });

    return response.data;
  },
};
