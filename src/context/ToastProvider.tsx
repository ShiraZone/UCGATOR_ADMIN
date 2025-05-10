// REACT
import React, { ReactNode } from 'react';
import {
    createContext,
    useContext
} from 'react';

import {
    toast,
    ToastOptions,
    ToastPosition,
} from 'react-toastify';

export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
}

interface ToastContextType {
    showToast: (
        message: string,
        type?: ToastType,
        config?: Partial<ToastOptions>
    ) => void;
}

import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext<ToastContextType | null>(null);

const defaultConfig: ToastOptions = {
    position: 'top-right' as ToastPosition,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: 'dark',
};

interface ToastProviderProps {
    children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const showToast = (
        message: string,
        type: ToastType = ToastType.INFO,
        config: Partial<ToastOptions> = {}
    ): void => {
        const toastConfig = {
            ...defaultConfig,
            ...config
        };

        switch (type) {
            case ToastType.SUCCESS:
                toast.success(message, toastConfig);
                break;
            case ToastType.ERROR:
                toast.error(message, toastConfig);
                break;
            case ToastType.WARNING:
                toast.warning(message, toastConfig);
                break;
            case ToastType.INFO:
            default:
                toast.info(message, toastConfig);
                break;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    );
};


// Custom hook to use the toast context
export const useToast = (): ToastContextType => {
    const toastContext = useContext(ToastContext);
    if (!toastContext) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return toastContext;
};