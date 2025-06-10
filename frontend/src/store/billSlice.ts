import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BillState {
  items: BillProduct[];
  selectedTable: number | null;
  orderType: 'in_house' | 'delivery';
}

const initialState: BillState = {
  items: [],
  selectedTable: null,
  orderType: 'in_house',
};

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<BillProduct>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearBill: (state) => {
      state.items = [];
    },
    setSelectedTable: (state, action: PayloadAction<number | null>) => {
      state.selectedTable = action.payload;
    },
    setOrderType: (state, action: PayloadAction<'in_house' | 'delivery'>) => {
      state.orderType = action.payload;
      if (action.payload === 'delivery') {
        state.selectedTable = null;
      }
    },
    setItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  clearBill,
  setSelectedTable,
  setOrderType,
  setItemQuantity,
} = billSlice.actions;

export default billSlice.reducer;