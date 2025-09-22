import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getColors } from '../constants/Colors';

interface VideoTransitionNotificationProps {
  visible: boolean;
  countdown: number;
  nextVideoTitle?: string;
  onCancel: () => void;
  onPlayNow?: () => void;
  isDark?: boolean;
}

export function VideoTransitionNotification({
  visible,
  countdown,
  nextVideoTitle,
  onCancel,
  onPlayNow,
  isDark = false,
}: VideoTransitionNotificationProps) {
  const colors = getColors(isDark);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible && countdown === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderColor: colors.border.light,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left side - Info */}
        <View style={styles.infoSection}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="play-circle"
              size={24}
              color={colors.accent}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Vidéo suivante dans {countdown}s
            </Text>
            {nextVideoTitle && (
              <Text
                style={[styles.subtitle, { color: colors.text.secondary }]}
                numberOfLines={1}
              >
                {nextVideoTitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          {onPlayNow && (
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: colors.accent }]}
              onPress={onPlayNow}
            >
              <Text style={styles.playButtonText}>Maintenant</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.background.secondary }]}
            onPress={onCancel}
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.background.secondary }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.accent,
              width: `${Math.max(0, (countdown / 5) * 100)}%`,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});