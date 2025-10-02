/**
 * ToastItem Component
 * Individual toast notification item
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Shadows } from '../../constants/Shadows';
import { ToastProps } from './types';

const TOAST_HEIGHT = 80;
const ANIMATION_DURATION = 300;

export const ToastItem: React.FC<ToastProps> = ({
  message,
  description,
  type = 'info',
  visible,
  onHide,
  duration = 4000,
  position = 'top',
  isDark = false,
  icon,
  actionText,
  onActionPress,
  accessibilityLabel,
}) => {
  const colors = getColors(isDark);
  const translateY = useRef(
    new Animated.Value(position === 'top' ? -TOAST_HEIGHT : TOAST_HEIGHT)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  // Auto-hide timer
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const show = () => {
    setIsVisible(true);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        onHide();
      }, duration);
    }
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -TOAST_HEIGHT : TOAST_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handlePress = () => {
    if (actionText && onActionPress) {
      onActionPress();
    } else {
      onHide();
    }
  };

  const getToastStyles = () => {
    const baseStyle = {
      backgroundColor: colors.background.surface,
      borderLeftWidth: 4,
    };

    const colorMap = {
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.accent,
    };

    return {
      ...baseStyle,
      borderLeftColor: colorMap[type],
      backgroundColor: colors.background.surface,
    };
  };

  const getIcon = () => {
    if (icon) return icon;

    const iconMap = {
      success: 'checkmark-circle' as const,
      error: 'close-circle' as const,
      warning: 'warning' as const,
      info: 'information-circle' as const,
    };

    return iconMap[type];
  };

  const getIconColor = () => {
    const colorMap = {
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.accent,
    };

    return colorMap[type];
  };

  const getTopPosition = () => {
    if (position === 'bottom') return undefined;

    const statusBarHeight =
      Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : StatusBar.currentHeight || 24;

    return statusBarHeight + Spacing.md;
  };

  if (!isVisible && !visible) {
    return null;
  }

  const toastStyles = getToastStyles();
  const iconName = getIcon();
  const iconColor = getIconColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          top: getTopPosition(),
          bottom: position === 'bottom' ? Spacing.xl2 : undefined,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, toastStyles, Shadows.lg]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel={accessibilityLabel || message}
        accessibilityRole="button"
      >
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.message, { color: colors.text.primary }]}>{message}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {description}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {actionText ? (
            <Text style={[styles.actionText, { color: iconColor }]}>{actionText}</Text>
          ) : (
            <Ionicons name="close" size={20} color={colors.text.tertiary} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    minHeight: TOAST_HEIGHT,
  },
  iconContainer: {
    marginRight: Spacing.sm2,
  },
  content: {
    flex: 1,
  },
  message: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  description: {
    ...Typography.small,
  },
  actionContainer: {
    marginLeft: Spacing.sm2,
  },
  actionText: {
    ...Typography.smallMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
