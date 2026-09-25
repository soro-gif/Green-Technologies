export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label?: string;
  is_active: boolean;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  services_count?: number;
  projects_count?: number;
  articles_count?: number;
  services?: Service[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  icon: string | null;
  image: string | null;
  image_url?: string | null;
  features: string[] | null;
  display_order: number;
  is_active: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface Project {
  id: number;
  category_id: number;
  service_id: number | null;
  title: string;
  slug: string;
  client_name: string | null;
  location: string | null;
  description: string;
  results: string | null;
  main_image: string | null;
  image?: string | null;
  image_url?: string | null;
  gallery: string[] | null;
  status: ProjectStatus;
  status_label?: string;
  budget_indicative: number | null;
  completion_date: string | null;
  is_featured: boolean;
  category?: Category;
  service?: Service;
  testimonials?: Testimonial[];
  created_at: string;
  updated_at: string;
}

export type QuoteStatus = 'pending' | 'in_review' | 'quoted' | 'accepted' | 'rejected';

export interface QuoteRequest {
  id: number;
  reference: string;
  category_id: number | null;
  service_id: number | null;
  full_name: string;
  company: string | null;
  email: string;
  phone: string;
  city: string | null;
  service_type: string | null;
  estimated_budget: number | null;
  details: string;
  status: QuoteStatus;
  status_label?: string;
  admin_notes?: string | null;
  contacted_at?: string | null;
  category?: Category;
  service?: Service;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  status_label?: string;
  reply_notes?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  project_id: number | null;
  author_name: string;
  author_role: string;
  company: string | null;
  avatar: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  project?: Project;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: ArticleStatus;
  status_label?: string;
  published_at: string | null;
  author?: User;
  category?: Category;
  created_at: string;
  updated_at: string;
}
