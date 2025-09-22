import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CapturedMoment } from '../types/moment';

interface MomentHistoryItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onDelete: () => void;
  showNewBadge?: boolean;
}

export const MomentHistoryItem: React.FC<MomentHistoryItemProps> = ({
  moment,
  onPlay,
  onDelete,
  showNewBadge = false,
}) => {

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le moment',
      'Êtes-vous sûr de vouloir supprimer ce moment ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
      { cancelable: true }
    );
  };

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
    <TouchableOpacity
      style={styles.container}
      onPress={onPlay}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Ionicons name="play" size={16} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.momentInfo}>
          <View style={styles.momentTitleRow}>
            <Text style={styles.momentTitle}>
              Moment à {formatTime(moment.timestamp)}
            </Text>
            {showNewBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau!</Text>
              </View>
            )}
          </View>
          <Text style={styles.momentMeta}>
            Capturé le {formatDateTime(moment.createdAt)}
          </Text>
        </View>

        <View style={styles.duration}>
          <Text style={styles.durationText}>
            {moment.duration}s
          </Text>
        </View>
      </View>

      {/* Bouton delete simple comme dans MomentsList */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        accessibilityLabel="Supprimer le moment"
        accessibilityHint="Supprimer ce moment capturé"
      >
        <Ionicons name="trash" size={18} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 8,
    position: 'relative',
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
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -16 }],
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