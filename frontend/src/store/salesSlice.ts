import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  discount_amount: string;
  total_price: string | number;
}

export interface Sale {
  id?: number;
  items: SaleItem[];
  receipt_number: string;
  cashier: number | null;
  total_price: string | number | null;
  discount_amount: string;
  payment_type: string | null;
  vat_amount: string | number;
  vat_rate: string | number;
}

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSales(state, action: PayloadAction<Sale[]>) {
      state.sales = action.payload;
    },
    setCurrentSale(state, action: PayloadAction<Sale | null>) {
      state.currentSale = action.payload;
    },
    addItemToSale(state, action: PayloadAction<SaleItem>) {
      if (!state.currentSale) {
        state.currentSale = {
          items: [],
          receipt_number: '',
          cashier: null,
          total_price: null,
          discount_amount: '0.00',
          payment_type: null,
          vat_amount: '0.00',
          vat_rate: '0.00'
        };
      }
      
      const existingItem = state.currentSale.items.find(
        (item) => item.product === action.payload.product
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.total_price = (parseFloat(existingItem.unit_price.toString()) || 0) * existingItem.quantity;
      } else {
        state.currentSale.items.push({
          ...action.payload,
          total_price: (parseFloat(action.payload.unit_price.toString()) || 0) * action.payload.quantity
        });
      }
      
      // Update total price
      state.currentSale.total_price = state.currentSale.items.reduce(
        (sum, item) => sum + (parseFloat(item.total_price.toString()) || 0), 
        0
      );
    },
    updateItemQuantity(state, action: PayloadAction<{id: number; quantity: number}>) {
      if (state.currentSale) {
        const item = state.currentSale.items.find(i => i.id === action.payload.id);
        if (item) {
          item.quantity = action.payload.quantity;
          item.total_price = (typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price.toString()) || 0) * item.quantity;
        }
      }
    },
    removeItemFromSale(state, action: PayloadAction<number>) {
      if (state.currentSale) {
        state.currentSale.items = state.currentSale.items.filter(
          (item) => item.id !== action.payload
        );
      }
    },
    updatePaymentType(state, action: PayloadAction<string>) {
      if (state.currentSale) {
        state.currentSale.payment_type = action.payload;
      }
    },
    applyDiscount(state, action: PayloadAction<string>) {
      if (state.currentSale) {
        state.currentSale.discount_amount = action.payload;
      }
    },
    clearCurrentSale(state) {
      state.currentSale = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSales,
  setCurrentSale,
  addItemToSale,
  updateItemQuantity,
  removeItemFromSale,
  updatePaymentType,
  applyDiscount,
  clearCurrentSale,
} = salesSlice.actions;

export default salesSlice.reducer;
