// front/src/axiosinstance.tsx
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { toast, Id } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { pickMessageFromData } from './features/shared/utils/httpError';

const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'https://bobrovsky.online';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// ---- JSON клиенты
export const postJson = <T = any>(url: string, data: any) =>
  axiosInstance.post<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });

export const putJson = <T = any>(url: string, data: any) =>
  axiosInstance.put<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });

export const patchJson = <T = any>(url: string, data: any) =>
  axiosInstance.patch<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });

// ---- FormData клиенты (НЕ указываем Content-Type)
export const postForm = <T = any>(url: string, form: FormData) =>
  axiosInstance.post<T>(url, form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

export const putForm = <T = any>(url: string, form: FormData) =>
  axiosInstance.put<T>(url, form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

export const patchForm = <T = any>(url: string, form: FormData) =>
  axiosInstance.patch<T>(url, form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

let toastId: Id | null = null;

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const refreshToken = localStorage.getItem('refresh_token');

    if (error.response && error.response.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post<{ access: string }>(
          `${API_BASE_URL}/api/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        if (axiosInstance.defaults.headers) {
          (axiosInstance.defaults.headers as any).Authorization = `Bearer ${access}`;
        }
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (!toast.isActive(toastId!)) {
          toastId = toast.error('Время сессии истекло. Пожалуйста, авторизуйтесь снова.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 5000);
        }
      }
    }

    if (error.response?.status === 429) {
      const serverMsg = pickMessageFromData(error.response.data);
      const message = serverMsg ?? 'Слишком много запросов. Попробуйте позже.';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
