import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getColors } from '../constants/Colors';
import { usePlaylist } from '../contexts/PlaylistContext';

interface PlaylistControlsProps {
  onAddToPlaylist: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  isDark?: boolean;
  compact?: boolean;
}

export function PlaylistControls({
  onAddToPlaylist,
  onNext,
  onPrevious,
  isLoading = false,
  isDark = false,
  compact = false,
}: PlaylistControlsProps) {
  const colors = getColors(isDark);
  const {
    currentState,
    hasNext,
    hasPrevious,
    getPlaylistProgress,
    toggleAutoPlay,
    toggleShuffle,
    toggleRepeat,
  } = usePlaylist();

  const progress = useMemo(() => getPlaylistProgress(), [getPlaylistProgress]);
  const canGoNext = useMemo(() => hasNext(), [hasNext]);
  const canGoPrevious = useMemo(() => hasPrevious(), [hasPrevious]);

  const handleNext = () => {
    if (canGoNext && onNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious && onPrevious) {
      onPrevious();
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {/* Progress indicator */}
        {progress && (
          <View style={[styles.progressContainer, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.progressText, { color: colors.text.secondary }]}>
              {progress.current}/{progress.total}
            </Text>
          </View>
        )}

        {/* Navigation controls */}
        <View style={styles.compactControls}>
          <TouchableOpacity
            style={[
              styles.compactNavButton,
              { backgroundColor: colors.background.secondary },
              !canGoPrevious && styles.disabledButton,
            ]}
            onPress={handlePrevious}
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
              styles.compactNavButton,
              { backgroundColor: colors.background.secondary },
              !canGoNext && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!canGoNext || isLoading}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={canGoNext ? colors.text.primary : colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactAddButton, { backgroundColor: colors.accent }]}
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
  }

  return (
    <View style={styles.container}>
      {/* Playlist status */}
      {currentState.currentPlaylist && (
        <View style={[styles.statusSection, { backgroundColor: colors.background.secondary }]}>
          <View style={styles.statusInfo}>
            <Text style={[styles.playlistName, { color: colors.text.primary }]}>
              {currentState.currentPlaylist.name}
            </Text>
            {progress && (
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                Vidéo {progress.current} sur {progress.total}
              </Text>
            )}
          </View>

          {/* Mode indicators */}
          <View style={styles.modeIndicators}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                currentState.autoPlay && { backgroundColor: colors.accent },
              ]}
              onPress={toggleAutoPlay}
            >
              <Ionicons
                name="play-circle"
                size={16}
                color={currentState.autoPlay ? '#fff' : colors.text.tertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                currentState.shuffle && { backgroundColor: colors.accent },
              ]}
              onPress={toggleShuffle}
            >
              <Ionicons
                name="shuffle"
                size={16}
                color={currentState.shuffle ? '#fff' : colors.text.tertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                currentState.repeat && { backgroundColor: colors.accent },
              ]}
              onPress={toggleRepeat}
            >
              <Ionicons
                name="repeat"
                size={16}
                color={currentState.repeat ? '#fff' : colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main controls */}
      <View style={styles.controlsSection}>
        {/* Navigation buttons */}
        <View style={styles.navigationControls}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: colors.background.secondary },
              !canGoPrevious && styles.disabledButton,
            ]}
            onPress={handlePrevious}
            disabled={!canGoPrevious || isLoading}
          >
            <Ionicons
              name="play-skip-back"
              size={28}
              color={canGoPrevious ? colors.text.primary : colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: colors.background.secondary },
              !canGoNext && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!canGoNext || isLoading}
          >
            <Ionicons
              name="play-skip-forward"
              size={28}
              color={canGoNext ? colors.text.primary : colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Add to playlist button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={onAddToPlaylist}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="list-outline" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter à playlist</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  statusInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
  },
  progressContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeIndicators: {
    flexDirection: 'row',
    gap: 6,
  },
  modeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  controlsSection: {
    gap: 12,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});