export interface PurchaseOrder {
  id: number;
  system: number;
  supplier: number;
  supplier_name: string;
  product: number;
  product_name: string;
  quantity: number;
  cost: string;
  order_date: string;
  expected_delivery_date: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
  total_received: number;
}
