// Purchase Order Type
export interface PurchaseOrder {
  id: number;
  supplier_id: number | null;
  product_id: number | null;
  quantity: number | null;
  cost: number | null;
  order_date: string | null;
  expected_delivery_date: string | null;
  status?: string;
}

// Goods Receiving Type
export interface GoodsReceiving {
  id: number;
  purchase_order_id: number | null;
  received_quantity: number | null;
  received_date: string | null;
  expiry_date: string | null;
  location: string;
}
