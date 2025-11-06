// front/src/features/services/model/slice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ServicesState, Service } from './types';
import { fetchServicesApi, fetchServiceBySlugApi } from '../api/api';

const initialState: ServicesState = {
  list: [],
  detail: null,
  loadingList: false,
  loadingDetail: false,
  errorList: null,
  errorDetail: null,
};

export const fetchServices = createAsyncThunk<Service[]>(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchServicesApi();
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Ошибка загрузки услуг');
    }
  }
);

export const fetchServiceBySlug = createAsyncThunk<Service, string>(
  'services/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchServiceBySlugApi(slug);
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Ошибка загрузки услуги');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearDetail(state) {
      state.detail = null;
      state.errorDetail = null;
      state.loadingDetail = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload as string;
      });

    builder
      .addCase(fetchServiceBySlug.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
        state.detail = null;
      })
      .addCase(fetchServiceBySlug.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.detail = action.payload;
      })
      .addCase(fetchServiceBySlug.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string;
      });
  },
});

export const { clearDetail } = servicesSlice.actions;
export default servicesSlice.reducer;
