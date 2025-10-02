/**
 * PodCut Button Component
 * Versatile button component with multiple variants and states
 * Optimized for touch interaction and driving safety
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ButtonProps } from './types';
import { ButtonContent } from './ButtonContent';
import { useButtonStyles } from './useButtonStyles';

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
  const { buttonStyles, textStyles, getIconSize } = useButtonStyles(variant, size, disabled, isDark);

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

  const iconColor = textStyles.color as string;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[buttonStyles, fullWidth && styles.fullWidth, disabled && styles.disabled, style]}
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
        <ButtonContent
          loading={loading}
          icon={icon}
          iconPosition={iconPosition}
          iconSize={getIconSize(iconSize)}
          iconColor={iconColor}
          title={title}
          subtitle={subtitle}
          textStyles={textStyles}
          textStyle={textStyle}
          size={size}
        />
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
});

export type { ButtonProps, ButtonVariant, ButtonSize } from './types';
