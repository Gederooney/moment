import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CapturedMoment } from '../types/moment';
import { SwipeableItem } from './SwipeableItem';
import { formatDuration } from '../utils/time';

interface SwipeableMomentItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onDelete: () => void;
  showNewBadge?: boolean;
}

export const SwipeableMomentItem: React.FC<SwipeableMomentItemProps> = ({
  moment,
  onPlay,
  onDelete,
  showNewBadge = false,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <SwipeableItem
      onDelete={onDelete}
      deleteConfirmTitle="Supprimer le moment"
      deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce moment ?"
      containerStyle={styles.swipeableContainer}
      showArchiveAction={false}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={onPlay}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Lire le moment à ${formatTime(moment.timestamp)}`}
        accessibilityHint="Appuyez pour lire ce moment, ou balayez vers la gauche pour supprimer"
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.playButton} onPress={onPlay}>
            <Ionicons name="play" size={16} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.momentInfo}>
            <View style={styles.momentTitleRow}>
              <Text style={styles.momentTitle}>Moment à {formatTime(moment.timestamp)}</Text>
              {showNewBadge && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Nouveau!</Text>
                </View>
              )}
            </View>
            <Text style={styles.momentMeta}>Capturé le {formatDateTime(moment.createdAt)}</Text>
          </View>

          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(moment.duration)}</Text>
          </View>

          {/* Swipe hint indicator */}
          <View style={styles.swipeHint}>
            <Ionicons name="swap-horizontal" size={14} color={Colors.text.tertiary} />
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 8,
  },
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  momentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  momentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  momentMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  duration: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  swipeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  newBadgeText: {
    color: Colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
});
