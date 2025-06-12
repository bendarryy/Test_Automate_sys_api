export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled' | 'served' | 'out_for_delivery';
export type OrderType = 'in_house' | 'delivery';
export interface OrderItem {
  id: string;
  menu_item: number;
  menu_item_name?: string;
  quantity: number;
}

export interface Order {
  id: string;
  system?: number;
  customer_name?: string | null;
  table_number: string;
  waiter?: number;
  status: OrderStatus;
  total_price: number | string;
  profit: number;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
  order_type?: OrderType;
  delivery_address?: string | null;
  customer_phone?: string | null;
}
