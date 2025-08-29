// front/src/features/auth/model/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiLogin, apiRegister, apiUpdateProfile } from '../api/api';
import type { AuthState, LoginDto, RegisterDto, LoginResponse, IUser } from './types';
import { pickMessageFromData } from '../../shared/utils/httpError';

type RejectPayload = { status: number; data: any };

const initialState: AuthState = {
  user: null,
  access: null,
  refresh: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const loginThunk = createAsyncThunk<LoginResponse, LoginDto, { rejectValue: RejectPayload }>(
  'auth/login',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await apiLogin(dto);
      return res;
    } catch (e: any) {
      const status = e?.response?.status ?? 0;
      const data = e?.response?.data ?? { detail: 'Неизвестная ошибка' };
      return rejectWithValue({ status, data });
    }
  }
);

export const registerThunk = createAsyncThunk<LoginResponse, RegisterDto, { rejectValue: RejectPayload }>(
  'auth/register',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await apiRegister(dto);
      return res;
    } catch (e: any) {
      const status = e?.response?.status ?? 0;
      const data = e?.response?.data ?? { detail: 'Неизвестная ошибка' };
      return rejectWithValue({ status, data });
    }
  }
);

export const updateProfileThunk = createAsyncThunk<
  IUser,
  { userId: string; payload: any },
  { rejectValue: RejectPayload }
>(
  'auth/updateProfile',
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateProfile(userId, payload);
      return res;
    } catch (e: any) {
      const status = e?.response?.status ?? 0;
      const data = e?.response?.data ?? { detail: 'Не удалось обновить профиль' };
      return rejectWithValue({ status, data });
    }
  }
);

// Гидратация из localStorage при старте
export const hydrateFromStorage = createAsyncThunk<{ access: string; refresh: string; user: IUser } | null>(
  'auth/hydrate',
  async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    if (!access || !refresh || !userStr) return null;
    try {
      const user = JSON.parse(userStr) as IUser;
      return { access, refresh, user };
    } catch {
      return null;
    }
  }
);

function extractErrorMessage(payload?: RejectPayload, fallback: string = 'Ошибка'): string {
  if (!payload) return fallback;
  const msg =
    pickMessageFromData(payload.data) ??
    (typeof payload.data === 'string' ? payload.data : null) ??
    payload.data?.detail ??
    payload.data?.message;
  return msg || fallback;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.refresh = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { user, refresh, access, token } = action.payload;
        const accessToken = access ?? token ?? null;
        state.user = user;
        state.refresh = refresh ?? null;
        state.access = accessToken;
        state.isAuthenticated = !!accessToken && !!refresh && !!user;

        if (accessToken) localStorage.setItem('access_token', accessToken);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload ?? undefined, 'Ошибка входа');
      })

      // REGISTER
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { user, refresh, access, token } = action.payload;
        const accessToken = access ?? token ?? null;
        state.user = user;
        state.refresh = refresh ?? null;
        state.access = accessToken;
        state.isAuthenticated = !!accessToken && !!refresh && !!user;

        if (accessToken) localStorage.setItem('access_token', accessToken);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload ?? undefined, 'Ошибка регистрации');
      })

      // UPDATE PROFILE
      .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })

      // HYDRATE
      .addCase(hydrateFromStorage.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { access, refresh, user } = action.payload;
        state.access = access;
        state.refresh = refresh;
        state.user = user;
        state.isAuthenticated = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
