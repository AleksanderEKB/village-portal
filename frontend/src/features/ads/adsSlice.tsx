// frontend/src/features/ads/adsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Advertisement } from '../../types/globalTypes';
import axiosInstance from '../../axiosInstance';
import { ADS_CATEGORY_LABELS } from './utils/adsCategories';

interface AdvertisementWithLabel extends Advertisement {
  category_label: string;
}

interface AdsState {
  ads: AdvertisementWithLabel[];
  currentAd: AdvertisementWithLabel | null;
  loading: boolean;
  error: string | null;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

const initialState: AdsState = {
  ads: [],
  currentAd: null,
  loading: false,
  error: null,
  count: undefined,
  next: null,
  previous: null,
};

function mapAdWithCategoryLabel(ad: Advertisement): AdvertisementWithLabel {
  return {
    ...ad,
    category_label: ADS_CATEGORY_LABELS[ad.category] ?? ad.category,
  };
}

type AdsApiResponse = {
  results: Advertisement[];
  count: number;
  next: string | null;
  previous: string | null;
};

export const fetchAdsPaginated = createAsyncThunk<
  AdsApiResponse,
  { limit: number; offset: number },
  { rejectValue: string }
>('ads/fetchAdsPaginated', async ({ limit, offset }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<AdsApiResponse>(`/api/ads/?limit=${limit}&offset=${offset}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки объявлений');
  }
});

export const fetchAdById = createAsyncThunk<
  Advertisement,
  string,
  { rejectValue: string }
>('ads/fetchAdById', async (slug, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<Advertisement>(`/api/ads/${slug}/`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки объявления');
  }
});

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    clearAds(state) {
      state.ads = [];
      state.count = undefined;
      state.next = null;
      state.previous = null;
    },
    setCurrentAd(state, action: PayloadAction<Advertisement | null>) {
      state.currentAd = action.payload ? mapAdWithCategoryLabel(action.payload) : null;
    },
    addAd(state, action: PayloadAction<Advertisement>) {
      state.ads.unshift(mapAdWithCategoryLabel(action.payload));
    },
    removeAd(state, action: PayloadAction<number>) {
      state.ads = state.ads.filter(ad => ad.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdsPaginated.fulfilled, (state, action) => {
        if (!action.meta.arg.offset) {
          // Первая страница, перезапись
          state.ads = action.payload.results.map(mapAdWithCategoryLabel);
        } else {
          // Следующие страницы - добавление
          state.ads = [...state.ads, ...action.payload.results.map(mapAdWithCategoryLabel)];
        }
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.loading = false;
      })
      .addCase(fetchAdsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.currentAd = mapAdWithCategoryLabel(action.payload);
        state.loading = false;
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAds, setCurrentAd, addAd, removeAd } = adsSlice.actions;
export default adsSlice.reducer;
