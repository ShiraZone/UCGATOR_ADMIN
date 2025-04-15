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

export const initializeApiToasts = (showToast: ShowToastFunction): void => {
    showToastFunction = showToast;
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
            const errorMessage = error.response?.data?.error || error.message || 'An unknown error occured';

            let toastType = ToastType.ERROR;

            if (error.response) {
                if (error.response.status === 404) {
                    toastType = ToastType.WARNING
                } else if (error.request.status === 401 || error.response.status === 403) {
                    toastType = ToastType.INFO;
                    // Redirect to login page in case of login misuse.
                    window.location.href = '/login';
                }
            } else if (error.request) {
                // Returns from a request without response
                toastType = ToastType.ERROR;

            }
            showToastFunction(errorMessage, toastType);
        }
        
        const status = error.response?.status ?? 500;
        const message = error.response?.statusText ?? 'Internal Server Error';

        window.location.href = `/error?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`;
        return Promise.reject(error);
    }
);

export default apiClient;