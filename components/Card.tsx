/**
 * PodCut Card Component
 * Flexible card container with consistent styling
 * Supports various layouts and interactions
 */

import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
} from 'react-native';
import { getColors } from '../constants/Colors';
import { Spacing, Component } from '../constants/Spacing';
import { Shadows, ComponentShadows } from '../constants/Shadows';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
type CardSize = 'small' | 'medium' | 'large';

interface CardProps {
  // Content
  children: ReactNode;

  // Behavior
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;

  // Appearance
  variant?: CardVariant;
  size?: CardSize;

  // Theme
  isDark?: boolean;

  // Layout
  fullWidth?: boolean;

  // Custom styles
  style?: ViewStyle;
  contentStyle?: ViewStyle;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  variant = 'default',
  size = 'medium',
  isDark = false,
  fullWidth = true,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}) => {
  const colors = getColors(isDark);
  const isInteractive = !!(onPress || onLongPress);

  // Get card styles based on variant
  const getCardStyles = (): ViewStyle => {
    const baseStyle = getBaseStyleForSize();

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: colors.background.surface,
          ...ComponentShadows.card,
        };

      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.background.surface,
          ...ComponentShadows.cardHover,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.background.surface,
          borderWidth: 1,
          borderColor: colors.border.light,
          ...Shadows.none,
        };

      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.background.secondary,
          ...Shadows.none,
        };

      default:
        return baseStyle;
    }
  };

  // Get base style for size
  const getBaseStyleForSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          padding: Spacing.sm2,
          borderRadius: Spacing.sm2,
        };

      case 'medium':
        return {
          ...Component.card,
        };

      case 'large':
        return {
          padding: Spacing.md3,
          borderRadius: Spacing.md2,
        };

      default:
        return Component.card;
    }
  };

  const cardStyles = getCardStyles();

  const containerStyle: ViewStyle = {
    ...cardStyles,
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.6 }),
    ...style,
  };

  // If interactive, wrap in TouchableOpacity
  if (isInteractive) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.9}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityState={{ disabled }}
      >
        <View style={contentStyle}>{children}</View>
      </TouchableOpacity>
    );
  }

  // Otherwise, use regular View
  return (
    <View
      style={containerStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

// Specialized card components

// Header card for important information
export const HeaderCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card {...props} variant="elevated" />
);

// Action card for interactive elements
export const ActionCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card {...props} variant="default" />
);

// Info card for displaying information
export const InfoCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card {...props} variant="outlined" />
);

// Content card for main content areas
export const ContentCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card {...props} variant="filled" />
);
