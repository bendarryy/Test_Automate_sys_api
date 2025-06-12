// TypeScript interfaces for CreateSystem

export interface CreateSystemRequest {
  name: string;
  category: 'restaurant' | 'supermarket';
  description?: string;
  is_public: boolean;
  subdomain?: string;
  custom_domain?: string;
  phone_number?: string;
  custom_link?: string;
}

export interface CreateSystemResponse {
  id: string;
  name: string;
  category: 'restaurant' | 'supermarket';
  description?: string;
  is_public: boolean;
  subdomain?: string;
  custom_domain?: string;
  phone_number?: string;
  custom_link?: string;
  created_at: string;
  updated_at: string;
}
