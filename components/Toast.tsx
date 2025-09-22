/**
 * PodCut Toast Component
 * Elegant temporary notifications with auto-dismiss
 * Optimized for driving safety with clear visual hierarchy
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { Shadows } from '../constants/Shadows';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastProps {
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

const { width: screenWidth } = Dimensions.get('window');
const TOAST_HEIGHT = 80;
const ANIMATION_DURATION = 300;

export const Toast: React.FC<ToastProps> = ({
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
  const translateY = useRef(new Animated.Value(
    position === 'top' ? -TOAST_HEIGHT : TOAST_HEIGHT
  )).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  // Auto-hide timer
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-hide after duration
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

  // Get toast styles based on type
  const getToastStyles = () => {
    const baseStyle = {
      backgroundColor: colors.background.surface,
      borderLeftWidth: 4,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          borderLeftColor: colors.success,
          backgroundColor: colors.background.surface,
        };

      case 'error':
        return {
          ...baseStyle,
          borderLeftColor: colors.error,
          backgroundColor: colors.background.surface,
        };

      case 'warning':
        return {
          ...baseStyle,
          borderLeftColor: colors.warning,
          backgroundColor: colors.background.surface,
        };

      case 'info':
      default:
        return {
          ...baseStyle,
          borderLeftColor: colors.accent,
          backgroundColor: colors.background.surface,
        };
    }
  };

  // Get icon based on type
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info':
      default: return 'information-circle';
    }
  };

  // Get icon color based on type
  const getIconColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info':
      default: return colors.accent;
    }
  };

  const toastStyles = getToastStyles();
  const iconName = getIcon();
  const iconColor = getIconColor();

  // Calculate top position (accounting for status bar)
  const getTopPosition = () => {
    if (position === 'bottom') return undefined;

    const statusBarHeight = Platform.OS === 'ios'
      ? (StatusBar.currentHeight || 44)
      : (StatusBar.currentHeight || 24);

    return statusBarHeight + Spacing.md;
  };

  if (!isVisible && !visible) {
    return null;
  }

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
        style={[
          styles.toast,
          toastStyles,
          Shadows.lg,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel={accessibilityLabel || message}
        accessibilityRole="button"
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName}
            size={24}
            color={iconColor}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.message, { color: colors.text.primary }]}>
            {message}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Action or Close */}
        <View style={styles.actionContainer}>
          {actionText ? (
            <Text style={[styles.actionText, { color: iconColor }]}>
              {actionText}
            </Text>
          ) : (
            <Ionicons
              name="close"
              size={20}
              color={colors.text.tertiary}
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onActionPress?: () => void;
}

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

// Toast container for rendering multiple toasts
export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onHideToast: (id: string) => void;
  isDark?: boolean;
  position?: ToastPosition;
}> = ({ toasts, onHideToast, isDark = false, position = 'top' }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          description={toast.description}
          type={toast.type}
          visible={true}
          onHide={() => onHideToast(toast.id)}
          duration={0} // Managed by useToast hook
          position={position}
          isDark={isDark}
          icon={toast.icon}
          actionText={toast.actionText}
          onActionPress={toast.onActionPress}
        />
      ))}
    </>
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