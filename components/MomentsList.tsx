import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CapturedMoment } from '../types/moment';
import { Colors } from '../constants/Colors';
import { SwipeableItem } from './SwipeableItem';

interface MomentsListProps {
  moments: CapturedMoment[];
  onPlayMoment: (timestamp: number) => void;
  onDeleteMoment: (id: string) => void;
}

export const MomentsList: React.FC<MomentsListProps> = ({
  moments,
  onPlayMoment,
  onDeleteMoment,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    return `${seconds}s`;
  };

  const renderMoment = ({ item, index }: { item: CapturedMoment; index: number }) => {
    return (
      <SwipeableItem
        onDelete={() => onDeleteMoment(item.id)}
        deleteConfirmTitle="Supprimer le moment"
        deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce moment ?"
        containerStyle={styles.swipeableContainer}
        showArchiveAction={false}
      >
        <TouchableOpacity
          style={styles.momentItem}
          onPress={() => onPlayMoment(item.timestamp)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Lire le moment ${index + 1} à ${formatTime(item.timestamp)}`}
          accessibilityHint="Appuyez pour lire ce moment, ou balayez vers la gauche pour supprimer"
        >
          <View style={styles.momentContent}>
            <View style={styles.momentInfo}>
              <View style={styles.momentHeader}>
                <Text style={styles.momentTitle}>
                  Moment {index + 1}
                </Text>
                <Text style={styles.momentDuration}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
              <Text style={styles.momentTimestamp}>
                Débute à {formatTime(item.timestamp)}
              </Text>
            </View>
            <View style={styles.momentActions}>
              <View style={styles.playIcon}>
                <Ionicons name="play" size={20} color={Colors.primary} />
              </View>
              {/* Swipe hint indicator */}
              <View style={styles.swipeHint}>
                <Ionicons name="swap-horizontal" size={14} color={Colors.text.tertiary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </SwipeableItem>
    );
  };

  if (moments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="radio-button-off" size={48} color={Colors.text.light} />
        <Text style={styles.emptyText}>Aucun moment capturé</Text>
        <Text style={styles.emptySubtext}>
          Appuyez sur "Capturer ce moment" pendant la lecture
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Moments
      </Text>
      <View style={styles.list}>
        {moments.map((item, index) => (
          <View key={item.id}>
            {renderMoment({ item, index })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  list: {
    // Removed flex: 1 to allow natural height
  },
  swipeableContainer: {
    marginBottom: 12,
  },
  momentItem: {
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  momentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  momentInfo: {
    flex: 1,
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  momentDuration: {
    fontSize: 12,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  momentTimestamp: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  momentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playIcon: {
    backgroundColor: Colors.background.primary,
    padding: 8,
    borderRadius: 8,
  },
  swipeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});