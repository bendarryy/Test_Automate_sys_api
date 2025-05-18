import { configureStore } from '@reduxjs/toolkit';
import billReducer from './billSlice';
import salesReducer from './salesSlice';

const store = configureStore({
  reducer: {
    bill: billReducer,
    sales: salesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;