import { useEffect } from 'react';
import { useToast } from '@/context/ToastProvider';
import { initializeApiToasts, resetApiToasts } from '@/config/apiClient.ts';

/**
 * Custom hook to initialize API toasts with proper cleanup
 * This ensures toast notifications are only registered once
 */
export const useApiToasts = (): void => {
  const { showToast } = useToast();
  
  useEffect(() => {
    // Initialize toasts when component mounts
    initializeApiToasts(showToast);
    
    // Return cleanup function to prevent memory leaks
    return () => {
      // Only need to reset in development to avoid issues with hot reloading
      if (import.meta.env.VITE_DEV) {
        resetApiToasts();
      }
    };
  }, []);
};
