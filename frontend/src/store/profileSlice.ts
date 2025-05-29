import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Profile {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    phone: string;
  };
  role: string;
  systems: { name: string; category: string; id: number }[] | number;
  actions: string[];
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearProfile(state) {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    setProfileLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setProfileError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProfile, clearProfile, setProfileLoading, setProfileError } = profileSlice.actions;
export default profileSlice.reducer;
