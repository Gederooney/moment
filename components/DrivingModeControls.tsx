import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getColors } from '../constants/Colors';
import { usePlaylist } from '../contexts/PlaylistContext';

interface DrivingModeControlsProps {
  onAddToPlaylist: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  isDark?: boolean;
}

export function DrivingModeControls({
  onAddToPlaylist,
  onNext,
  onPrevious,
  isLoading = false,
  isDark = false,
}: DrivingModeControlsProps) {
  const colors = getColors(isDark);
  const {
    currentState,
    hasNext,
    hasPrevious,
    getPlaylistProgress,
    toggleAutoPlay,
  } = usePlaylist();

  const progress = getPlaylistProgress();
  const canGoNext = hasNext();
  const canGoPrevious = hasPrevious();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      {/* Top row - Playlist info and modes */}
      {currentState.currentPlaylist && (
        <View style={styles.topRow}>
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistName, { color: colors.text.primary }]} numberOfLines={1}>
              {currentState.currentPlaylist.name}
            </Text>
            {progress && (
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                {progress.current} / {progress.total}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.autoPlayButton,
              currentState.autoPlay && { backgroundColor: colors.accent },
            ]}
            onPress={toggleAutoPlay}
          >
            <Ionicons
              name="play-circle"
              size={20}
              color={currentState.autoPlay ? '#fff' : colors.text.secondary}
            />
            <Text
              style={[
                styles.autoPlayText,
                { color: currentState.autoPlay ? '#fff' : colors.text.secondary },
              ]}
            >
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main controls row */}
      <View style={styles.controlsRow}>
        {/* Previous button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.background.primary },
            !canGoPrevious && styles.disabledButton,
          ]}
          onPress={onPrevious}
          disabled={!canGoPrevious || isLoading}
        >
          <Ionicons
            name="play-skip-back"
            size={32}
            color={canGoPrevious ? colors.text.primary : colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Add to playlist button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={onAddToPlaylist}
          disabled={isLoading}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.addButtonText}>Playlist</Text>
        </TouchableOpacity>

        {/* Next button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.background.primary },
            !canGoNext && styles.disabledButton,
          ]}
          onPress={onNext}
          disabled={!canGoNext || isLoading}
        >
          <Ionicons
            name="play-skip-forward"
            size={32}
            color={canGoNext ? colors.text.primary : colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12,
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
  },
  autoPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  autoPlayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.4,
  },
});