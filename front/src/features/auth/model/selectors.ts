// front/src/features/auth/model//selectors.ts
import { RootState } from '../../../app/store';

export const selectAuth = (s: RootState) => s.auth;
export const selectIsAuth = (s: RootState) => s.auth.isAuthenticated;
export const selectUser = (s: RootState) => s.auth.user;
export const selectAuthLoading = (s: RootState) => s.auth.loading;
export const selectAuthError = (s: RootState) => s.auth.error;
export const selectAuthLoaded = (s: RootState) => s.auth.authLoaded;
