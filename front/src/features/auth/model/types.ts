// front/src/features/auth/model/types.ts
export type UUIDHex = string;

export interface IUser {
  id: UUIDHex;           // public_id hex
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  is_active: boolean;
  created: string;
  updated: string;
  avatar?: string | null;
}

export interface AuthState {
  user: IUser | null;
  access: string | null;
  refresh: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authLoaded: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  password: string;
  avatar?: File | null;
}

export type LoginResponse = {
  user: IUser;
  access?: string; // login
  refresh: string;
  token?: string;  // register
};

export type RefreshResponse = { access: string };
