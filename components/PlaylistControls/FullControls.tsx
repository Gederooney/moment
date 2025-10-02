/**
 * FullControls Component
 * Full version of playlist controls with mode indicators
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Playlist } from '../../contexts/PlaylistContext';

interface FullControlsProps {
  currentPlaylist?: Playlist;
  progress?: { current: number; total: number };
  autoPlay: boolean;
  shuffle: boolean;
  repeat: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading: boolean;
  isDark: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onAddToPlaylist: () => void;
  onToggleAutoPlay: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export const FullControls: React.FC<FullControlsProps> = ({
  currentPlaylist,
  progress,
  autoPlay,
  shuffle,
  repeat,
  canGoPrevious,
  canGoNext,
  isLoading,
  isDark,
  onPrevious,
  onNext,
  onAddToPlaylist,
  onToggleAutoPlay,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const colors = getColors(isDark);

  return (
    <View style={styles.container}>
      {currentPlaylist && (
        <View style={[styles.statusSection, { backgroundColor: colors.background.secondary }]}>
          <View style={styles.statusInfo}>
            <Text style={[styles.playlistName, { color: colors.text.primary }]}>
              {currentPlaylist.name}
            </Text>
            {progress && (
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                Vidéo {progress.current} sur {progress.total}
              </Text>
            )}
          </View>

          <View style={styles.modeIndicators}>
            <TouchableOpacity
              style={[styles.modeButton, autoPlay && { backgroundColor: colors.accent }]}
              onPress={onToggleAutoPlay}
            >
              <Ionicons
                name="play-circle"
                size={16}
                color={autoPlay ? '#fff' : colors.text.tertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, shuffle && { backgroundColor: colors.accent }]}
              onPress={onToggleShuffle}
            >
              <Ionicons name="shuffle" size={16} color={shuffle ? '#fff' : colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, repeat && { backgroundColor: colors.accent }]}
              onPress={onToggleRepeat}
            >
              <Ionicons name="repeat" size={16} color={repeat ? '#fff' : colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.controlsSection}>
        <View style={styles.navigationControls}>
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
            onPress={onNext}
            disabled={!canGoNext || isLoading}
          >
            <Ionicons
              name="play-skip-forward"
              size={28}
              color={canGoNext ? colors.text.primary : colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

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
};

const styles = StyleSheet.create({
  container: {
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowOffset: { width: 0, height: 2 },
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
