import React from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/Colors';
import { Typography, DrivingTypography } from '../constants/Typography';
import { Component, DrivingSpacing } from '../constants/Spacing';
import { ComponentShadows, GlowShadows } from '../constants/Shadows';
import { useCaptureAnimation, formatTime } from './useCaptureAnimation';
import { styles } from './CaptureButton.styles';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  currentTime: number;
  isDark?: boolean;
  drivingMode?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  modern?: boolean;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  onCapture,
  disabled = false,
  currentTime,
  isDark = false,
  drivingMode = false,
  loading = false,
  accessibilityLabel,
  modern = false,
}) => {
  const colors = getColors(isDark);
  const { scaleValue, pulseValue, handlePressAnimation } = useCaptureAnimation(
    drivingMode,
    disabled,
    loading
  );

  const getButtonStyle = () => {
    if (modern) {
      return {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: disabled
          ? '#E0E0E0'
          : loading
            ? '#FF3B30B0'
            : '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: disabled ? 0 : 0.3,
        shadowRadius: 8,
        elevation: disabled ? 0 : 8,
      };
    }

    if (drivingMode) {
      return {
        ...DrivingSpacing.primaryButton,
        backgroundColor: disabled
          ? colors.background.disabled
          : loading
            ? colors.primary + '80'
            : colors.primary,
        ...GlowShadows.capture,
      };
    }

    return {
      ...Component.buttonLarge,
      backgroundColor: disabled
        ? colors.background.disabled
        : loading
          ? colors.primary + '80'
          : colors.primary,
      ...ComponentShadows.captureButton,
    };
  };

  const getTextStyle = () => {
    if (drivingMode) {
      return DrivingTypography.primary;
    }
    return Typography.buttonLarge;
  };

  const getIconSize = () => {
    if (modern) return 32;
    return drivingMode ? 40 : 32;
  };

  if (modern) {
    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }],
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        <TouchableOpacity
          style={[getButtonStyle(), disabled && styles.buttonDisabled]}
          onPress={() => handlePressAnimation(onCapture)}
          disabled={disabled || loading}
          activeOpacity={0.7}
          accessibilityLabel={
            accessibilityLabel || `Capturer le moment à ${formatTime(currentTime)}`
          }
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
          accessibilityHint="Appuyez pour capturer ce moment de la vidéo"
        >
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Ionicons
              name="radio-button-on"
              size={getIconSize()}
              color={disabled ? '#999' : 'white'}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }],
        },
        disabled && styles.containerDisabled,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle(), disabled && styles.buttonDisabled]}
        onPress={() => handlePressAnimation(onCapture)}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel || `Capturer le moment à ${formatTime(currentTime)}`}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        accessibilityHint="Appuyez pour capturer ce moment de la vidéo"
      >
        <View style={styles.iconContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingSpinner,
                  {
                    transform: [{ rotate: '0deg' }],
                  },
                ]}
              >
                <Ionicons name="hourglass-outline" size={getIconSize()} color={colors.text.white} />
              </Animated.View>
            </View>
          ) : (
            <Ionicons
              name="radio-button-on"
              size={getIconSize()}
              color={disabled ? colors.text.tertiary : colors.text.white}
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              getTextStyle(),
              styles.buttonText,
              { color: disabled ? colors.text.tertiary : colors.text.white },
              disabled && styles.buttonTextDisabled,
            ]}
          >
            {loading ? 'CAPTURE EN COURS...' : 'CAPTURER CE MOMENT'}
          </Text>
          <Text
            style={[
              drivingMode ? DrivingTypography.info : Typography.small,
              styles.timeText,
              { color: disabled ? colors.text.tertiary : colors.text.white },
              disabled && styles.timeTextDisabled,
            ]}
          >
            à {formatTime(currentTime)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
