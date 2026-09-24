import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ApiResponse, HealthCheckData } from '../types/api';

/**
 * Hook to test and monitor technical health of the backend API
 */
export function useHealthCheck() {
  return useQuery<ApiResponse<HealthCheckData>, Error>({
    queryKey: ['api-health'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<HealthCheckData>>('/health');
      return response.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });
}
