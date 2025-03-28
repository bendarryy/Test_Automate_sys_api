import { configureStore } from "@reduxjs/toolkit";
import billReducer from "./billSlice";

const store = configureStore({
  reducer: {
    bill: billReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;