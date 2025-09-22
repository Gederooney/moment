/**
 * QueueContainer Component
 * Main container for the video queue with fixed height and gradient background
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface QueueContainerProps {
  children: React.ReactNode;
  isDark?: boolean;
  style?: ViewStyle;
}

export const QueueContainer: React.FC<QueueContainerProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
    alignSelf: 'center',
    maxWidth: '95%',
  },
});