// frontend/src/axiosinstance.tsx
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { toast, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pickMessageFromData } from './features/shared/utils/httpError';

const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'https://bobrovsky.online';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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

        // --- Глобальный refresh по 401 ---
        if (
            error.response &&
            error.response.status === 401 &&
            refreshToken &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const response = await axios.post<{ access: string }>(
                    `${API_BASE_URL}/api/auth/refresh/`,
                    { refresh: refreshToken }
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

        // --- Глобальный перехват 429 (Throttle) ---
        if (error.response?.status === 429) {
            const serverMsg = pickMessageFromData(error.response.data);
            // Если бекенд (DRF) вернул локализованный detail, отдадим его.
            // Иначе — дефолтное русское сообщение.
            const message = serverMsg ?? 'Слишком много запросов. Попробуйте позже.';
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
