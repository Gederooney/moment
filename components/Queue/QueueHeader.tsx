/**
 * QueueHeader Component
 * Header with queue title, counter and add button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface QueueHeaderProps {
  queueCount: number;
  onAddPress: () => void;
  isDark?: boolean;
}

export const QueueHeader: React.FC<QueueHeaderProps> = ({
  queueCount,
  onAddPress,
  isDark = true,
}) => {
  const colors = getColors(isDark);
  const [scaleValue] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        File d'attente ({queueCount})
      </Text>

      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          accessibilityLabel="Ajouter une vidéo à la file d'attente"
          accessibilityRole="button"
        >
          <Ionicons
            name="add"
            size={20}
            color={colors.text.white}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm2,
  },
  title: {
    ...Typography.body,
    fontWeight: '500',
    fontSize: 14,
    opacity: 0.7,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});