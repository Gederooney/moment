/**
 * Button Types
 */

import { Ionicons } from '@expo/vector-icons';
import { ViewStyle, TextStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large' | 'driving';

export interface ButtonProps {
  // Content
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  iconSize?: number;

  // Behavior
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;

  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;

  // Theme
  isDark?: boolean;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Custom styles
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Animation
  disableAnimation?: boolean;
}
