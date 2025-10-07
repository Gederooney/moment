/**
 * FolderMomentItem Component
 * Displays a moment within a folder view with swipe to remove
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CapturedMoment } from '../types/moment';
import { SwipeableItem } from './SwipeableItem';
import { MomentEditModal } from './moments/MomentEditModal';
import { useMomentsContext } from '../contexts/MomentsContext';

interface FolderMomentItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onRemoveFromFolder: () => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const FolderMomentItem: React.FC<FolderMomentItemProps> = ({
  moment,
  onPlay,
  onRemoveFromFolder,
}) => {
  const { updateMoment } = useMomentsContext();
  const [showEditModal, setShowEditModal] = useState(false);

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const handleSaveEdit = (momentId: string, updates: Partial<CapturedMoment>) => {
    updateMoment(momentId, updates);
  };

  const thumbnailUrl = getThumbnailUrl(moment.videoId);

  return (
    <>
      <SwipeableItem
        onDelete={onRemoveFromFolder}
        deleteConfirmTitle="Retirer du dossier"
        deleteConfirmMessage="Voulez-vous retirer ce moment de ce dossier ?"
        deleteButtonText="Retirer"
        containerStyle={styles.swipeableContainer}
        showArchiveAction={false}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={onPlay}
          onLongPress={() => setShowEditModal(true)}
          activeOpacity={0.7}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {moment.title || 'Sans titre'}
            </Text>
            <Text style={styles.timestamp}>
              à {formatTime(moment.timestamp)}
            </Text>
            {moment.notes && (
              <View style={styles.notesIndicator}>
                <Ionicons name="document-text-outline" size={12} color={Colors.text.secondary} />
                <Text style={styles.notesText}>Notes</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </SwipeableItem>

      {/* Edit Modal - same as player page */}
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
    padding: 12,
    backgroundColor: Colors.background.white,
    gap: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
    position: 'relative',
  },
  thumbnail: {
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
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  notesText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});
