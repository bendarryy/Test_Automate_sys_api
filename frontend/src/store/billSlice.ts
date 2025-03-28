import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface BillState {
  items: Product[];
  selectedTable: string | null; // إضافة حالة الطاولة المحددة
}

const initialState: BillState = {
  items: [],
  selectedTable: null, // الطاولة الافتراضية غير محددة
};

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearBill: (state) => {
      state.items = [];
    },
    setSelectedTable: (state, action: PayloadAction<string | null>) => {
      state.selectedTable = action.payload; // تحديث الطاولة المحددة
    },
  },
});

export const { addItem, removeItem, clearBill, setSelectedTable } =
  billSlice.actions;
export default billSlice.reducer;