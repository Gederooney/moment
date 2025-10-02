/**
 * CompactControls Component
 * Compact version of playlist controls
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';

interface CompactControlsProps {
  progress?: { current: number; total: number };
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading: boolean;
  isDark: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onAddToPlaylist: () => void;
}

export const CompactControls: React.FC<CompactControlsProps> = ({
  progress,
  canGoPrevious,
  canGoNext,
  isLoading,
  isDark,
  onPrevious,
  onNext,
  onAddToPlaylist,
}) => {
  const colors = getColors(isDark);

  return (
    <View style={styles.container}>
      {progress && (
        <View style={[styles.progressContainer, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.progressText, { color: colors.text.secondary }]}>
            {progress.current}/{progress.total}
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.background.secondary },
            !canGoPrevious && styles.disabledButton,
          ]}
          onPress={onPrevious}
          disabled={!canGoPrevious || isLoading}
        >
          <Ionicons
            name="play-skip-back"
            size={20}
            color={canGoPrevious ? colors.text.primary : colors.text.tertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.background.secondary },
            !canGoNext && styles.disabledButton,
          ]}
          onPress={onNext}
          disabled={!canGoNext || isLoading}
        >
          <Ionicons
            name="play-skip-forward"
            size={20}
            color={canGoNext ? colors.text.primary : colors.text.tertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={onAddToPlaylist}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
