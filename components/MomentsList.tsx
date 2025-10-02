import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CapturedMoment } from '../types/moment';
import { Colors } from '../constants/Colors';
import { SwipeableItem } from './SwipeableItem';
import { formatDuration } from '../utils/time';
import { MomentEditModal } from './moments/MomentEditModal';
import { useMomentsContext } from '../contexts/MomentsContext';

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
  const { updateMoment } = useMomentsContext();
  const [editingMoment, setEditingMoment] = useState<CapturedMoment | null>(null);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const handleLongPress = (moment: CapturedMoment) => {
    setEditingMoment(moment);
  };

  const handleSaveEdit = (momentId: string, updates: Partial<CapturedMoment>) => {
    updateMoment(momentId, updates);
    setEditingMoment(null);
  };

  const renderMoment = ({ item, index }: { item: CapturedMoment; index: number }) => {
    const thumbnailUrl = getThumbnailUrl(item.videoId);

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
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Lire le moment ${index + 1} à ${formatTime(item.timestamp)}`}
          accessibilityHint="Appuyez pour lire ce moment, maintenez pour éditer, ou balayez pour supprimer"
        >
          {/* Thumbnail 72x72 avec image YouTube */}
          <View style={styles.momentThumbnail}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={28} color="#FFFFFF" />
            </View>
          </View>

          {/* Info */}
          <View style={styles.momentInfo}>
            <Text style={styles.momentTitle} numberOfLines={1}>
              Moment {index + 1}
            </Text>
            <Text style={styles.momentTimestamp}>à {formatTime(item.timestamp)}</Text>
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
        <Text style={styles.emptySubtext}>Appuyez sur "Capturer ce moment" pendant la lecture</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.header}>Moments</Text>
        <View style={styles.list}>
          {moments.map((item, index) => (
            <View key={item.id}>{renderMoment({ item, index })}</View>
          ))}
        </View>
      </View>

      {editingMoment && (
        <MomentEditModal
          moment={editingMoment}
          visible={!!editingMoment}
          onClose={() => setEditingMoment(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
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
    gap: 16,
  },
  swipeableContainer: {
    marginBottom: 0,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 12,
    backgroundColor: 'transparent',
  },
  momentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  momentTimestamp: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
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
