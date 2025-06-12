// TypeScript interfaces for UpdateSystem

export interface UpdateSystemRequest {
  name: string;
  category: 'restaurant' | 'supermarket';
  description?: string;
  is_public: boolean;
  subdomain?: string;
  custom_domain?: string;
  phone_number?: string;
  custom_link?: string;
  password: string;
  is_active: boolean;
}

export interface UpdateSystemResponse {
  id: string;
  name: string;
  category: 'restaurant' | 'supermarket';
  description?: string;
  is_public: boolean;
  subdomain?: string;
  custom_domain?: string;
  phone_number?: string;
  custom_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
