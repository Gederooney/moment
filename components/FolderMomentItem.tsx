/**
 * FolderMomentItem Component
 * Displays a moment within a folder view
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CapturedMoment } from '../types/moment';

interface FolderMomentItemProps {
  moment: CapturedMoment;
  onPlay: () => void;
  onRemoveFromFolder: () => void;
  onEdit: () => void;
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
  onEdit,
}) => {
  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const handleRemove = () => {
    Alert.alert(
      'Retirer du dossier',
      'Voulez-vous retirer ce moment de ce dossier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: onRemoveFromFolder,
        },
      ]
    );
  };

  const thumbnailUrl = getThumbnailUrl(moment.videoId);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPlay}
      onLongPress={onEdit}
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

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Ionicons name="create-outline" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background.white,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 6,
  },
});
