// Form types for Create System
export interface CreateSystemFormValues {
  name: string;
  category: "restaurant" | "supermarket";
  description?: string;
  is_public?: boolean;
  subdomain?: string;
  custom_domain?: string;
  phone_number?: string;
  custom_link?: string;
  password?: string; // optional for edit/update mode
}
