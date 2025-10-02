/**
 * EmptyState Types
 */

import { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';

export type EmptyStateVariant = 'default' | 'search' | 'error' | 'loading' | 'success';

export interface EmptyStateAction {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface EmptyStateProps {
  // Content
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  illustration?: ReactNode;

  // Actions
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;

  // Appearance
  variant?: EmptyStateVariant;
  isDark?: boolean;

  // Layout
  compact?: boolean;

  // Custom styles
  style?: ViewStyle;

  // Accessibility
  accessibilityLabel?: string;
}
