import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Social } from '../../types/globalTypes';
import type { RootState } from '../../app/store';

// Тип ответа API с пагинацией
type SocialsApiResponse = {
  results: Social[];
  count: number;
  next: string | null;
  previous: string | null;
};

interface SocialState {
  socials: Social[];
  loading: boolean;
  error: string | null;
  currentSocial: Social | null;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

const initialState: SocialState = {
  socials: [],
  loading: false,
  error: null,
  currentSocial: null,
  count: undefined,
  next: null,
  previous: null,
};

export const fetchSocials = createAsyncThunk<SocialsApiResponse, void, { state: RootState }>(
  'social/fetchSocials',
  async (_, thunkAPI) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bobrovsky.online';
      const response = await axios.get<SocialsApiResponse>(`${API_BASE_URL}/api/info/social/`);
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
      .addCase(fetchSocials.fulfilled, (state, action: PayloadAction<SocialsApiResponse>) => {
        state.socials = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
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
