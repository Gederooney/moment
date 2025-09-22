import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Vibration,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/Colors';
import { Typography, DrivingTypography } from '../constants/Typography';
import { Spacing, Component, DrivingSpacing } from '../constants/Spacing';
import { ComponentShadows, GlowShadows } from '../constants/Shadows';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  currentTime: number;
  isDark?: boolean;
  drivingMode?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  modern?: boolean; // Nouveau prop pour le design moderne
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
  const [scaleValue] = useState(new Animated.Value(1));
  const [pulseValue] = useState(new Animated.Value(1));
  const colors = getColors(isDark);

  // Pulse animation for better visibility while driving
  useEffect(() => {
    if (!drivingMode || disabled || loading) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [drivingMode, disabled, loading, pulseValue]);

  const handlePress = () => {
    if (disabled || loading) return;

    // Haptic feedback for better driving experience
    if (Platform.OS === 'ios') {
      Vibration.vibrate([100]);
    } else {
      Vibration.vibrate(100);
    }

    // Enhanced animation feedback
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.92,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    onCapture();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonStyle = () => {
    if (modern) {
      return {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: disabled
          ? '#E0E0E0'
          : loading
          ? '#FF3B30B0' // Semi-transparent rouge
          : '#FF3B30', // Rouge YouTube
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: {
          width: 0,
          height: 4,
        },
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
            transform: [
              { scale: Animated.multiply(scaleValue, pulseValue) },
            ],
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        <TouchableOpacity
          style={[
            getButtonStyle(),
            disabled && styles.buttonDisabled,
          ]}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel || `Capturer le moment à ${formatTime(currentTime)}`}
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
          accessibilityHint="Appuyez pour capturer ce moment de la vidéo"
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="white"
            />
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
          transform: [
            { scale: Animated.multiply(scaleValue, pulseValue) },
          ],
        },
        disabled && styles.containerDisabled,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
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
                <Ionicons
                  name="hourglass-outline"
                  size={getIconSize()}
                  color={colors.text.white}
                />
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
          <Text style={[
            getTextStyle(),
            styles.buttonText,
            { color: disabled ? colors.text.tertiary : colors.text.white },
            disabled && styles.buttonTextDisabled,
          ]}>
            {loading ? 'CAPTURE EN COURS...' : 'CAPTURER CE MOMENT'}
          </Text>
          <Text style={[
            drivingMode ? DrivingTypography.info : Typography.small,
            styles.timeText,
            { color: disabled ? colors.text.tertiary : colors.text.white },
            disabled && styles.timeTextDisabled,
          ]}>
            à {formatTime(currentTime)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md2,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    // Loading animation can be added here
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    // Handled by color prop
  },
  timeText: {
    textAlign: 'center',
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  timeTextDisabled: {
    // Handled by color prop
  },
});