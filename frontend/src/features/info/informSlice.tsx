import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Social } from '../../types/globalTypes';
import type { RootState } from '../../app/store';

interface SocialState {
  socials: Social[];
  loading: boolean;
  error: string | null;
  currentSocial: Social | null;
}

const initialState: SocialState = {
  socials: [],
  loading: false,
  error: null,
  currentSocial: null,
};

export const fetchSocials = createAsyncThunk<Social[], void, { state: RootState }>(
  'social/fetchSocials',
  async (_, thunkAPI) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bobrovsky.online';
      const response = await axios.get<Social[]>(`${API_BASE_URL}/api/info/social/`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Ошибка загрузки');
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setCurrentSocial(state, action: PayloadAction<Social | null>) {
      state.currentSocial = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocials.fulfilled, (state, action: PayloadAction<Social[]>) => {
        state.socials = action.payload;
        state.loading = false;
      })
      .addCase(fetchSocials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentSocial } = socialSlice.actions;

export default socialSlice.reducer;
