export interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  is_available: boolean
  category: string
  image: string
  created_at: string
  updated_at: string
  rating?: number
  reviews_count?: number
  ingredients?: string[]
  allergens?: string[]
  calories?: number
  prep_time?: string
}

export interface RestaurantSystem {
  name: string
  description: string
  category: string
  phone_number: string | null
  latitude: number | null
  longitude: number | null
  custom_domain: string | null
  logo: string
  public_title: string
  public_description: string
  primary_color: string
  secondary_color: string
  email: string
  whatsapp_number: string
  social_links: Record<string, string>
  slider_images: SliderImage[]
  opening_hours?: OpeningHours
  address?: string
}

export interface SliderImage {
  image: string
  caption: string
  is_active: boolean
}

export interface OpeningHours {
  [key: string]: { open: string; close: string; closed?: boolean }
}

export interface CartItem extends MenuItem {
  quantity: number
  special_instructions?: string
}

export interface Review {
  id: number
  user_name: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export interface Reservation {
  id?: number
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  special_requests?: string
}

export interface RestaurantAPIData {
  system: RestaurantSystem;
  menu: Record<string, MenuItem[]>;
}
