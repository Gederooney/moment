/**
 * Toast Types
 * Type definitions for Toast component system
 */

import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  // Content
  message: string;
  description?: string;
  type?: ToastType;

  // Behavior
  visible: boolean;
  onHide: () => void;
  duration?: number; // in milliseconds
  position?: ToastPosition;

  // Appearance
  isDark?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;

  // Actions
  actionText?: string;
  onActionPress?: () => void;

  // Accessibility
  accessibilityLabel?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onActionPress?: () => void;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onHideToast: (id: string) => void;
  isDark?: boolean;
  position?: ToastPosition;
}
