import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number; // إضافة خاصية الكمية
}

interface BillState {
  items: Product[];
  selectedTable: number | null; // إضافة حالة الطاولة المحددة
  orderType: 'in_house' | 'delivery';
}

const initialState: BillState = {
  items: [],
  selectedTable: null, // الطاولة الافتراضية غير محددة
  orderType: 'in_house',
};

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity; // Increment quantity
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity });
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
    },
  },
});

export const { addItem, removeItem, clearBill, setSelectedTable, setOrderType } =
  billSlice.actions;
export default billSlice.reducer;