export interface BaseOrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  notes?: string;
}

export interface BaseOrder {
  id: number;
  order_items: BaseOrderItem[];
  total_price: number;
  status: string;
  created_at?: string;
  table_number?: number;
  customer_name?: string;
  delivery_address?: string;
  customer_phone?: string;
  order_type?: string;
}

export type DeliveryStatus = 'ready' | 'out_for_delivery' | 'completed';
export type WaiterStatus = 'ready' | 'served' | 'completed';

export interface DeliveryOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: number | null;
  waiter: string | null;
  total_price: string;
  profit: number;
  status: DeliveryStatus;
  order_type: 'delivery';
  order_items: BaseOrderItem[];
  created_at: string;
  updated_at: string;
  delivery_address?: string;
  customer_phone?: string;
}
