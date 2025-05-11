import axios, {
    AxiosInstance,
    AxiosResponse,
    AxiosError
} from 'axios';

// CONTEXT
import { ToastType } from '@/context/ToastProvider';

import { ApiResponse } from '@/data/types';

// Define the type for the toast function
type ShowToastFunction = (
    message: string,
    type: ToastType,
    config?: any
) => void;

// This will be initialized from your components
let showToastFunction: ShowToastFunction | null = null;
let isInitialized = false;

export const initializeApiToasts = (showToast: ShowToastFunction): void => {
    if (!isInitialized) {
        showToastFunction = showToast;
        isInitialized = true;
        console.log('Toast notification system initialized');
    }
};

// Reset function for testing or when the toast provider unmounts
export const resetApiToasts = (): void => {
    showToastFunction = null;
    isInitialized = false;
    console.log('Toast notification system reset');
};

export const url = import.meta.env.VITE_API_URL
const apiClient: AxiosInstance = axios.create({
    baseURL: url,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const MAX_RETRIES = 3;

apiClient.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<ApiResponse<T>> => {
        // Handle success message
        if (response.data?.success && response.data?.message && showToastFunction) {
            showToastFunction(response.data.message, ToastType.SUCCESS);
        }
        return response;
    },

    async (error: AxiosError<ApiResponse> & { config: any }): Promise<never> => {
        const originalRequest = error.config;

        if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
        }

        const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status < 600);

        if (shouldRetry && originalRequest._retryCount < MAX_RETRIES) {
            originalRequest._retryCount += 1;
            return apiClient(originalRequest);
        }

        if (showToastFunction) {
            let message;
            const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';

            if (typeof errorMessage === 'string' && errorMessage.includes('<!DOCTYPE html>')) {
                const matches = errorMessage.match(/<pre>Error: (.*?)<br>/);
                message = matches ? matches[1] : 'An error occurred while parsing the response';
            } else {
                message = typeof errorMessage === 'string' ? errorMessage : 'An unknown error occurred';
            }
            let toastType = ToastType.ERROR;

            if (error.response) {
                if (error.response.status === 404) {
                    toastType = ToastType.WARNING;
                } else if (error.response.status === 401 || error.response.status === 403) {
                    toastType = ToastType.INFO;
                    // Only redirect for authentication errors
                    window.location.href = '/login';
                }
            } else if (error.request) {
                toastType = ToastType.ERROR;
            }

            showToastFunction(message, toastType);
        }

        // Only redirect to error page for server errors (500s)
        if (error.response?.status && error.response.status >= 500) {
            const status = error.response.status;
            const message = error.response.statusText || 'Internal Server Error';
            window.location.href = `/error?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`;
        }

        return Promise.reject(error);
    }
);

export default apiClient;