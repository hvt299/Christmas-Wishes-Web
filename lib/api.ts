import axios from 'axios';
import { getValidAuthToken, clearAuthData } from '@/utils/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? getValidAuthToken() : null;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            clearAuthData();
            const currentPath = window.location.pathname;
            const isAuthRoute =
                currentPath.startsWith('/login') ||
                currentPath.startsWith('/forgot-password') ||
                currentPath.startsWith('/reset-password') ||
                currentPath.startsWith('/auth/verify');

            if (!isAuthRoute) {
                window.location.href = `/login?session_expired=true`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
