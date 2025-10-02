/**
 * useToast Hook
 * Hook for managing multiple toasts
 */

import { useState } from 'react';
import { ToastItem, ToastType } from './types';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    setToasts(current => [...current, newToast]);

    // Auto-remove after duration
    const duration = toast.duration || 4000;
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (message: string, description?: string) => {
    showToast({ message, description, type: 'success' });
  };

  const showError = (message: string, description?: string) => {
    showToast({ message, description, type: 'error' });
  };

  const showWarning = (message: string, description?: string) => {
    showToast({ message, description, type: 'warning' });
  };

  const showInfo = (message: string, description?: string) => {
    showToast({ message, description, type: 'info' });
  };

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
