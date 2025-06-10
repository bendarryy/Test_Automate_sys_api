// Order type for Waiter Display
export interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_items: OrderItem[];
  total_price: number;
  status: 'ready' | 'served' | 'completed' | string;
  created_at?: string;
  table_number?: number;
  customer_name?: string;
  updated_at: string;
}
