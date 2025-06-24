import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types/globalTypes';

const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem('access_token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ access: string; refresh: string; user: User }>) {
            localStorage.setItem('access_token', action.payload.access);
            localStorage.setItem('refresh_token', action.payload.refresh);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.loading = false;
            state.error = null;
        },
        registerSuccess(state, action: PayloadAction<{ access: string; refresh: string; user: User }>) {
            localStorage.setItem('access_token', action.payload.access);
            localStorage.setItem('refresh_token', action.payload.refresh);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.loading = false;
            state.error = null;
        },
        updateUserSuccess(state, action: PayloadAction<User>) {
            localStorage.setItem('user', JSON.stringify(action.payload));
            state.user = action.payload;
        },
        registerFail(state, action: PayloadAction<string | null>) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = action.payload;
        },
        loginFail(state, action: PayloadAction<string | null>) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = action.payload;
        },
        logout(state) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = null;
        },
        deleteProfileSuccess(state, action: PayloadAction<string | null>) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = action.payload;
        },
        authLoading(state) {
            state.loading = true;
        },
    },
});

export const {
    loginSuccess,
    registerSuccess,
    updateUserSuccess,
    registerFail,
    loginFail,
    logout,
    deleteProfileSuccess,
    authLoading,
} = authSlice.actions;

export default authSlice.reducer;
