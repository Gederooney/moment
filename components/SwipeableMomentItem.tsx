import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CapturedMoment } from '../types/moment';
import { SwipeableItem } from './SwipeableItem';
import { formatDuration } from '../utils/time';
import { MomentEditModal } from './moments/MomentEditModal';
import { useMomentsContext } from '../contexts/MomentsContext';

interface SwipeableMomentItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onDelete: () => void;
  showNewBadge?: boolean;
}

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

export const SwipeableMomentItem: React.FC<SwipeableMomentItemProps> = ({
  moment,
  onPlay,
  onDelete,
  showNewBadge = false,
}) => {
  const { updateMoment } = useMomentsContext();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce moment',
      'Êtes-vous sûr de vouloir supprimer ce moment ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  const handleLongPress = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = (momentId: string, updates: Partial<CapturedMoment>) => {
    updateMoment(momentId, updates);
  };

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const thumbnailUrl = getThumbnailUrl(moment.videoId);

  return (
    <>
      <SwipeableItem
        onDelete={handleDelete}
        deleteConfirmTitle=""
        deleteConfirmMessage=""
        containerStyle={styles.swipeableContainer}
        showArchiveAction={false}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={onPlay}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Lire le moment à ${formatTime(moment.timestamp)}`}
          accessibilityHint="Appuyez pour lire ce moment, maintenez pour éditer, ou balayez pour supprimer"
        >
          {/* Thumbnail 72x72 - Wireframe 3 */}
          <View style={styles.thumbnail}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.momentTitle} numberOfLines={1}>
              {moment.title}
            </Text>
            <Text style={styles.momentMeta}>
              à {formatTime(moment.timestamp)} min
            </Text>
          </View>
        </TouchableOpacity>
      </SwipeableItem>

      <MomentEditModal
        moment={moment}
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  momentInfo: {
    flex: 1,
  },
  momentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  momentMeta: {
    fontSize: 13,
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
