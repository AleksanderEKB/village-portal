// frontend/src/features/ads/adsSlice.tsx

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Advertisement } from '../../types/globalTypes';
import axiosInstance from '../../axiosInstance';
import { ADS_CATEGORY_LABELS } from './adsCategories';

interface AdvertisementWithLabel extends Advertisement {
  category_label: string;
}

interface AdsState {
  ads: AdvertisementWithLabel[];
  currentAd: AdvertisementWithLabel | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdsState = {
  ads: [],
  currentAd: null,
  loading: false,
  error: null,
};

function mapAdWithCategoryLabel(ad: Advertisement): AdvertisementWithLabel {
  return {
    ...ad,
    category_label: ADS_CATEGORY_LABELS[ad.category] ?? ad.category,
  };
}

export const fetchAds = createAsyncThunk<Advertisement[]>(
  'ads/fetchAds',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<Advertisement[]>('/api/ads/');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки объявлений');
    }
  }
);

export const fetchAdById = createAsyncThunk<Advertisement, string>(
  'ads/fetchAdById',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<Advertisement>(`/api/ads/${slug}/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки объявления');
    }
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAds(state, action: PayloadAction<Advertisement[]>) {
      state.ads = action.payload.map(mapAdWithCategoryLabel);
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
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.ads = action.payload.map(mapAdWithCategoryLabel);
        state.loading = false;
      })
      .addCase(fetchAds.rejected, (state, action) => {
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

export const { setAds, setCurrentAd, addAd, removeAd } = adsSlice.actions;
export default adsSlice.reducer;
