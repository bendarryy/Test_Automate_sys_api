// Product type definitions

export interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  expiry_date: string;
}

export interface ProductStockHistory {
  id: number;
  product_id: number;
  change: number;
  date: string;
}

export interface AddProductPayload {
  name: string;
  price: string;
  stock_quantity: number;
  expiry_date: string;
}

export interface UpdateStockPayload {
  stock_quantity: number;
}
