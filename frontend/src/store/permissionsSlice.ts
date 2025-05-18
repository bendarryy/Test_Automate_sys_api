import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PermissionsState {
  actions: string[];
  loaded: boolean;
}

const initialState: PermissionsState = {
  actions: [],
  loaded: false,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions(state, action: PayloadAction<string[]>) {
      state.actions = action.payload;
      state.loaded = true;
    },
    clearPermissions(state) {
      state.actions = [];
      state.loaded = false;
    },
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
