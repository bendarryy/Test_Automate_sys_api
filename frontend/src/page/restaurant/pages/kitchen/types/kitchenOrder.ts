export interface KitchenOrder {
  id: number;
  status: 'pending' | 'preparing' | 'ready';
  customer_name?: string;
  table_number?: string;
  created_at?: string;
  order_items: {
    id: number;
    menu_item_name: string;
    quantity: number;
    notes?: string;
  }[];
  total_price: string;
}
