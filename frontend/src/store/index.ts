import { configureStore } from '@reduxjs/toolkit';
import billReducer from './billSlice';
import salesReducer from './salesSlice';
import permissionsReducer from './permissionsSlice';
import profileReducer from './profileSlice';

const store = configureStore({
  reducer: {
    bill: billReducer,
    sales: salesReducer,
    permissions: permissionsReducer,
    profile: profileReducer,
  },
  // middleware, devTools, etc. can be configured here if needed
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;