// front/src/features/auth/api/api.ts
import axiosInstance, { postForm, postJson, patchForm } from '../../../axiosInstance';
import type { LoginDto, RegisterDto, LoginResponse, IUser } from '../model/types';

export async function apiLogin(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await postJson<LoginResponse>('/api/auth/login/', dto);
  return data;
}

export async function apiRegister(dto: RegisterDto): Promise<LoginResponse> {
  const form = new FormData();
  form.append('email', dto.email);
  form.append('first_name', dto.first_name);
  form.append('last_name', dto.last_name);
  form.append('password', dto.password);
  if (dto.avatar) form.append('avatar', dto.avatar);
  if (dto.phone_number) form.append('phone_number', dto.phone_number);

  const { data } = await postForm<LoginResponse>('/api/auth/register/', form);
  return data;
}

// Обновление профиля (пример: смена имени/аватара)
export async function apiUpdateProfile(userId: string, payload: Partial<Omit<IUser, 'id'|'created'|'updated'|'is_active'>> & { avatar?: File | null } ): Promise<IUser> {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      form.append(k, v as any);
    }
  });
  const { data } = await patchForm<IUser>(`/api/user/${userId}/`, form);
  return data;
}


// запрос письма для восстановления
export async function apiRequestPasswordReset(email: string): Promise<{ detail: string }> {
  const { data } = await postJson<{ detail: string }>('/api/auth/password-reset/', { email });
  return data;
}

// подтверждение сброса по токену
export async function apiConfirmPasswordReset(token: string, password: string): Promise<{ detail: string }> {
  const { data } = await postJson<{ detail: string }>('/api/auth/password-reset/confirm/', { token, password });
  return data;
}

export const apiChangePassword = async (payload: { old_password: string; new_password: string }) => {
  const { data } = await postJson<{ detail: string }>('/api/auth/change-password/', payload);
  return data;
};