/**
 * PodCut Button Component
 * Versatile button component with multiple variants and states
 * Optimized for touch interaction and driving safety
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/Colors';
import { Typography, DrivingTypography } from '../constants/Typography';
import { Spacing, Component, DrivingSpacing } from '../constants/Spacing';
import { Shadows, ComponentShadows, createShadow } from '../constants/Shadows';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large' | 'driving';

interface ButtonProps {
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

export const Button: React.FC<ButtonProps> = ({
  title,
  subtitle,
  icon,
  iconPosition = 'left',
  iconSize,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isDark = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  disableAnimation = false,
}) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const colors = getColors(isDark);

  // Handle press animation
  const handlePressIn = () => {
    if (disabled || loading || disableAnimation) return;

    Animated.timing(scaleValue, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading || disableAnimation) return;

    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Get button styles based on variant
  const getButtonStyles = (): ViewStyle => {
    const baseStyle = getBaseStyleForSize();

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.background.disabled : colors.primary,
          ...ComponentShadows.buttonPrimary,
        };

      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.background.disabled : colors.secondary,
          ...ComponentShadows.button,
        };

      case 'tertiary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.background.disabled : colors.background.secondary,
          ...ComponentShadows.button,
        };

      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.background.disabled : colors.error,
          ...createShadow(colors.error, 4, 8, 0.3),
        };

      case 'success':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.background.disabled : colors.success,
          ...createShadow(colors.success, 4, 8, 0.2),
        };

      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: colors.background.primary,
          borderWidth: 2,
          borderColor: disabled ? colors.border.light : colors.primary,
          ...ComponentShadows.button,
        };

      default:
        return baseStyle;
    }
  };

  // Get text styles based on variant
  const getTextStyles = (): TextStyle => {
    const baseTextStyle = getBaseTextStyleForSize();

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.text.white,
        };

      case 'secondary':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.text.inverse,
        };

      case 'tertiary':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.text.primary,
        };

      case 'danger':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.text.white,
        };

      case 'success':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.text.white,
        };

      case 'outline':
        return {
          ...baseTextStyle,
          color: disabled ? colors.text.tertiary : colors.primary,
        };

      default:
        return baseTextStyle;
    }
  };

  // Get base style for size
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
        return {
          ...Component.button,
        };

      case 'large':
        return {
          paddingVertical: Spacing.md3,
          paddingHorizontal: Spacing.lg,
          borderRadius: Spacing.md2,
          minHeight: 64,
        };

      case 'driving':
        return {
          ...DrivingSpacing.primaryButton,
        };

      default:
        return Component.button;
    }
  };

  // Get base text style for size
  const getBaseTextStyleForSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          ...Typography.small,
          fontWeight: '600',
        };

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

  // Get icon size based on button size
  const getIconSize = (): number => {
    if (iconSize) return iconSize;

    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      case 'driving': return 32;
      default: return 20;
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();
  const iconColor = textStyles.color as string;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'large'}
            color={iconColor}
          />
          {size !== 'small' && (
            <Text style={[textStyles, textStyle, { marginLeft: Spacing.sm }]}>
              Chargement...
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={iconColor}
            style={{ marginRight: Spacing.sm }}
          />
        )}

        {/* Text Content */}
        <View style={subtitle ? styles.textColumn : undefined}>
          <Text style={[textStyles, textStyle]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[textStyles, styles.subtitle, textStyle]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={iconColor}
            style={{ marginLeft: Spacing.sm }}
          />
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <TouchableOpacity
        style={[
          buttonStyles,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});