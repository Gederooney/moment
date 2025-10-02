import { useState, useEffect } from 'react';
import { Animated, Vibration, Platform } from 'react-native';

export const useCaptureAnimation = (
  drivingMode: boolean,
  disabled: boolean,
  loading: boolean
) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [pulseValue] = useState(new Animated.Value(1));

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
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [drivingMode, disabled, loading, pulseValue]);

  const handlePressAnimation = (onCapture: () => void) => {
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

  return {
    scaleValue,
    pulseValue,
    handlePressAnimation,
  };
};

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
