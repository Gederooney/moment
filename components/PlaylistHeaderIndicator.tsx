import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getColors } from '../constants/Colors';
import { usePlaylist } from '../contexts/PlaylistContext';

interface PlaylistHeaderIndicatorProps {
  isDark?: boolean;
  onPress?: () => void;
}

export function PlaylistHeaderIndicator({ isDark = false, onPress }: PlaylistHeaderIndicatorProps) {
  const colors = getColors(isDark);
  const { currentState, getPlaylistProgress } = usePlaylist();

  if (!currentState.currentPlaylist) {
    return null;
  }

  const progress = getPlaylistProgress();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background.secondary }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Playlist icon */}
        <Ionicons name="list" size={16} color={colors.accent} />

        {/* Progress info */}
        {progress && (
          <Text style={[styles.progressText, { color: colors.text.primary }]}>
            {progress.current}/{progress.total}
          </Text>
        )}

        {/* Mode indicators */}
        <View style={styles.indicators}>
          {currentState.autoPlay && <Ionicons name="play-circle" size={12} color={colors.accent} />}
          {currentState.shuffle && (
            <Ionicons name="shuffle" size={12} color={colors.text.secondary} />
          )}
          {currentState.repeat && (
            <Ionicons name="repeat" size={12} color={colors.text.secondary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
