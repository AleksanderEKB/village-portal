// frontend/src/features/userProfile/userProfileSlice.tsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
import { UserWithAvatar, PostExtended, Advertisement } from '../../types/globalTypes';

interface UserProfileState {
    profile: UserWithAvatar | null;
    posts: PostExtended[];
    ads: Advertisement[];
    currentAd: Advertisement | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserProfileState = {
    profile: null,
    posts: [],
    ads: [],
    currentAd: null,
    loading: false,
    error: null,
};

// Thunk для получения объявления по slug
export const fetchAdvertisementBySlug = createAsyncThunk(
    'userProfile/fetchAdvertisementBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<Advertisement>(`/api/ads/${slug}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки объявления');
        }
    }
);

// Thunk для обновления объявления
export const updateAdvertisement = createAsyncThunk(
    'userProfile/updateAdvertisement',
    async (
        { slug, formData }: { slug: string; formData: FormData },
        { rejectWithValue }
    ) => {
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

// Остальные thunks (fetchUserProfile, updateUserProfile, deleteUserProfile, deleteAdvertisement)
export const fetchUserProfile = createAsyncThunk(
    'userProfile/fetchUserProfile',
    async (userId: number | string) => {
        const [profile, posts, adsRes] = await Promise.all([
            axiosInstance.get<UserWithAvatar>(`/api/user/${userId}/`),
            axiosInstance.get<PostExtended[]>('/api/post/'),
            axiosInstance.get<Advertisement[]>('/api/ads/'),
        ]);
        const filteredPosts = posts.data.filter(post => String(post.author.id) === String(userId));
        const filteredAds = adsRes.data.filter((ad: Advertisement) => String(ad.user.id) === String(userId));
        return { profile: profile.data, posts: filteredPosts, ads: filteredAds };
    }
);

export const updateUserProfile = createAsyncThunk(
    'userProfile/updateUserProfile',
    async (
        { userId, formData }: { userId: number | string; formData: FormData },
        { rejectWithValue }
    ) => {
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

export const deleteUserProfile = createAsyncThunk(
    'userProfile/deleteUserProfile',
    async (userId: number | string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/user/${userId}/`);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Ошибка удаления профиля');
        }
    }
);

export const deleteAdvertisement = createAsyncThunk(
    'userProfile/deleteAdvertisement',
    async (slug: string, { rejectWithValue }) => {
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
        },
        clearCurrentAd(state) {
            state.currentAd = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Удаление объявления
            .addCase(deleteAdvertisement.fulfilled, (state, action) => {
                state.ads = state.ads.filter(ad => ad.slug !== action.payload);
                if (state.currentAd && state.currentAd.slug === action.payload) {
                    state.currentAd = null;
                }
            })
            // Загрузка профиля пользователя
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload.profile;
                state.posts = action.payload.posts;
                state.ads = action.payload.ads;
                state.loading = false;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка загрузки профиля';
            })
            // Обновление профиля пользователя
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
            // Удаление профиля
            .addCase(deleteUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUserProfile.fulfilled, (state) => {
                state.profile = null;
                state.posts = [];
                state.ads = [];
                state.currentAd = null;
                state.loading = false;
            })
            .addCase(deleteUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Ошибка удаления профиля';
            })
            // Загрузка объявления по slug
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
            // Обновление объявления
            .addCase(updateAdvertisement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAdvertisement.fulfilled, (state, action) => {
                state.currentAd = action.payload;
                state.loading = false;
                // обновим ads, если slug совпадает
                state.ads = state.ads.map(ad =>
                    ad.slug === action.payload.slug ? action.payload : ad
                );
            })
            .addCase(updateAdvertisement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Ошибка обновления объявления';
            })
    },
});

export default userProfileSlice.reducer;
export const { clearUserProfile, clearCurrentAd } = userProfileSlice.actions;
