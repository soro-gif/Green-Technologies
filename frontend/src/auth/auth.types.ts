export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}
