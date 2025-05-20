export interface OrderResponse {
  id: number;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  is_available: boolean;
  description: string;
  image?: string | null;
}
