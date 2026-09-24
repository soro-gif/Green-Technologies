/**
 * Standard API Response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard Paginated Meta
 */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

/**
 * Standard Paginated API Response
 */
export interface ApiPaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]> | string | null;
}

/**
 * Health check data contract
 */
export interface HealthCheckData {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}
