/**
 * useButtonStyles Hook
 * Custom hook for button styling logic
 */

import { ViewStyle, TextStyle } from 'react-native';
import { getColors } from '../../constants/Colors';
import { Typography, DrivingTypography } from '../../constants/Typography';
import { Spacing, Component, DrivingSpacing } from '../../constants/Spacing';
import { ComponentShadows, createShadow } from '../../constants/Shadows';
import { ButtonVariant, ButtonSize } from './types';

export const useButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  isDark: boolean
) => {
  const colors = getColors(isDark);

  const getBaseStyleForSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm2,
          paddingHorizontal: Spacing.md,
          borderRadius: Spacing.sm2,
          minHeight: 40,
        };
      case 'medium':
        return Component.button;
      case 'large':
        return {
          paddingVertical: Spacing.md3,
          paddingHorizontal: Spacing.lg,
          borderRadius: Spacing.md2,
          minHeight: 64,
        };
      case 'driving':
        return DrivingSpacing.primaryButton;
      default:
        return Component.button;
    }
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle = getBaseStyleForSize();

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        ...baseStyle,
        backgroundColor: disabled ? colors.background.disabled : colors.primary,
        ...ComponentShadows.buttonPrimary,
      },
      secondary: {
        ...baseStyle,
        backgroundColor: disabled ? colors.background.disabled : colors.secondary,
        ...ComponentShadows.button,
      },
      tertiary: {
        ...baseStyle,
        backgroundColor: disabled ? colors.background.disabled : colors.background.secondary,
        ...ComponentShadows.button,
      },
      danger: {
        ...baseStyle,
        backgroundColor: disabled ? colors.background.disabled : colors.error,
        ...createShadow(colors.error, 4, 8, 0.3),
      },
      success: {
        ...baseStyle,
        backgroundColor: disabled ? colors.background.disabled : colors.success,
        ...createShadow(colors.success, 4, 8, 0.2),
      },
      outline: {
        ...baseStyle,
        backgroundColor: colors.background.primary,
        borderWidth: 2,
        borderColor: disabled ? colors.border.light : colors.primary,
        ...ComponentShadows.button,
      },
    };

    return variantStyles[variant];
  };

  const getBaseTextStyleForSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { ...Typography.small, fontWeight: '600' };
      case 'medium':
        return Typography.button;
      case 'large':
        return Typography.buttonLarge;
      case 'driving':
        return DrivingTypography.primary;
      default:
        return Typography.button;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = getBaseTextStyleForSize();

    const textColorMap: Record<ButtonVariant, string> = {
      primary: disabled ? colors.text.tertiary : colors.text.white,
      secondary: disabled ? colors.text.tertiary : colors.text.inverse,
      tertiary: disabled ? colors.text.tertiary : colors.text.primary,
      danger: disabled ? colors.text.tertiary : colors.text.white,
      success: disabled ? colors.text.tertiary : colors.text.white,
      outline: disabled ? colors.text.tertiary : colors.primary,
    };

    return {
      ...baseTextStyle,
      color: textColorMap[variant],
    };
  };

  const getIconSize = (customIconSize?: number): number => {
    if (customIconSize) return customIconSize;

    const sizeMap = {
      small: 16,
      medium: 20,
      large: 24,
      driving: 32,
    };

    return sizeMap[size];
  };

  return {
    buttonStyles: getButtonStyles(),
    textStyles: getTextStyles(),
    getIconSize,
  };
};
