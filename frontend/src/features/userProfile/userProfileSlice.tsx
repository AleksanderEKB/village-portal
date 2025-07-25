// frontend/src/features/userProfile/userProfileSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
import type { UserWithAvatar, PostExtended, Advertisement } from '../../types/globalTypes';

// Типы для пагинированных ответов
type PostsApiResponse = {
  results: PostExtended[];
  count: number;
  next: string | null;
  previous: string | null;
};

type AdsApiResponse = {
  results: Advertisement[];
  count: number;
  next: string | null;
  previous: string | null;
};

type FetchUserProfileResponse = {
  profile: UserWithAvatar;
  posts: PostExtended[];
};

interface UserProfileState {
  profile: UserWithAvatar | null;
  posts: PostExtended[];
  ads: Advertisement[];
  currentAd: Advertisement | null;
  loading: boolean;
  error: string | null;
  adsCount?: number;
  adsNext?: string | null;
  adsPrevious?: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  posts: [],
  ads: [],
  currentAd: null,
  loading: false,
  error: null,
  adsCount: undefined,
  adsNext: null,
  adsPrevious: null,
};

// Получение объявлений пользователя по страницам (новая пагинация)
export const fetchUserAdsPaginated = createAsyncThunk<
  AdsApiResponse,
  { userId: number | string; limit: number; offset: number },
  { rejectValue: string }
>(
  'userProfile/fetchUserAdsPaginated',
  async ({ userId, limit, offset }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<AdsApiResponse>('/api/ads/', {
        params: { user: userId, mine: 1, limit, offset },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки объявлений');
    }
  }
);

// Получение профиля пользователя и его постов
export const fetchUserProfile = createAsyncThunk<
  FetchUserProfileResponse,
  number | string
>('userProfile/fetchUserProfile', async (userId) => {
  const [profile, postsRes] = await Promise.all([
    axiosInstance.get<UserWithAvatar>(`/api/user/${userId}/`),
    axiosInstance.get<PostsApiResponse>('/api/post/', { params: { user: userId } }),
  ]);
  return {
    profile: profile.data,
    posts: postsRes.data.results,
  };
});

export const fetchAdvertisementBySlug = createAsyncThunk<Advertisement, string>(
  'userProfile/fetchAdvertisementBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Advertisement>(`/api/ads/${slug}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки объявления');
    }
  }
);

export const updateAdvertisement = createAsyncThunk<Advertisement, { slug: string; formData: FormData }>(
  'userProfile/updateAdvertisement',
  async ({ slug, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<Advertisement>(
        `/api/ads/${slug}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления объявления');
    }
  }
);

export const updateUserProfile = createAsyncThunk<UserWithAvatar, { userId: number | string; formData: FormData }>(
  'userProfile/updateUserProfile',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<UserWithAvatar>(
        `/api/user/${userId}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления профиля');
    }
  }
);

export const deleteUserProfile = createAsyncThunk<number | string, number | string>(
  'userProfile/deleteUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/user/${userId}/`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка удаления профиля');
    }
  }
);

export const deleteAdvertisement = createAsyncThunk<string, string>(
  'userProfile/deleteAdvertisement',
  async (slug, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/ads/${slug}/`);
      return slug;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка удаления объявления');
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile(state) {
      state.profile = null;
      state.posts = [];
      state.ads = [];
      state.currentAd = null;
      state.adsCount = undefined;
      state.adsNext = null;
      state.adsPrevious = null;
    },
    clearCurrentAd(state) {
      state.currentAd = null;
    },
    clearUserAds(state) {
      state.ads = [];
      state.adsCount = undefined;
      state.adsNext = null;
      state.adsPrevious = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- ПРОФИЛЬ ---
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.profile;
        state.posts = action.payload.posts;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки профиля';
      })

      // --- ПАГИНАЦИЯ ОБЪЯВЛЕНИЙ ПОЛЬЗОВАТЕЛЯ ---
      .addCase(fetchUserAdsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAdsPaginated.fulfilled, (state, action) => {
        if (action.meta.arg.offset === 0) {
          state.ads = action.payload.results;
        } else {
          state.ads = [...state.ads, ...action.payload.results];
        }
        state.adsCount = action.payload.count;
        state.adsNext = action.payload.next;
        state.adsPrevious = action.payload.previous;
        state.loading = false;
      })
      .addCase(fetchUserAdsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка загрузки объявлений';
      })

      // --- УДАЛЕНИЕ ОБЪЯВЛЕНИЯ ---
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.ads = state.ads.filter((ad) => ad.slug !== action.payload);
        if (state.currentAd && state.currentAd.slug === action.payload) {
          state.currentAd = null;
        }
      })

      // --- ОДНО ОБЪЯВЛЕНИЕ ---
      .addCase(fetchAdvertisementBySlug.pending, (state) => {
        state.loading = true;
        state.currentAd = null;
      })
      .addCase(fetchAdvertisementBySlug.fulfilled, (state, action) => {
        state.currentAd = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdvertisementBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка загрузки объявления';
        state.currentAd = null;
      })

      // --- ОБНОВЛЕНИЕ ОБЪЯВЛЕНИЯ ---
      .addCase(updateAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.currentAd = action.payload;
        state.loading = false;
        state.ads = state.ads.map((ad) =>
          ad.slug === action.payload.slug ? action.payload : ad
        );
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка обновления объявления';
      })

      // --- ОБНОВЛЕНИЕ ПРОФИЛЯ ---
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка обновления профиля';
      })

      // --- УДАЛЕНИЕ ПРОФИЛЯ ---
      .addCase(deleteUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserProfile.fulfilled, (state) => {
        state.profile = null;
        state.posts = [];
        state.ads = [];
        state.currentAd = null;
        state.adsCount = undefined;
        state.adsNext = null;
        state.adsPrevious = null;
        state.loading = false;
      })
      .addCase(deleteUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка удаления профиля';
      });
  },
});

export default userProfileSlice.reducer;
export const { clearUserProfile, clearCurrentAd, clearUserAds } = userProfileSlice.actions;
