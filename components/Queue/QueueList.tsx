/**
 * QueueList Component
 * Horizontal scrollable list of video items with empty state
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { QueueItem, QueueVideoItem } from './QueueItem';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface QueueListProps {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  onVideoPress: (video: QueueVideoItem) => void;
  onVideoRemove?: (video: QueueVideoItem) => void;
  onVideoReorder?: (newOrder: QueueVideoItem[]) => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const QueueList: React.FC<QueueListProps> = ({
  videos,
  currentVideoId,
  onVideoPress,
  onVideoRemove,
  onVideoReorder,
  isDark = true,
  style,
}) => {
  const colors = getColors(isDark);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
        Aucune vidéo en attente
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.tertiary }]}>
        Appuyez sur + pour ajouter des vidéos
      </Text>
    </View>
  );

  if (videos.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderEmptyState()}
      </View>
    );
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueVideoItem>) => {
    const isCurrentVideo = item.id === currentVideoId;

    return (
      <View
        style={[
          styles.itemContainer,
          isActive && styles.dragging,
          isCurrentVideo && styles.currentVideoContainer,
        ]}
      >
        <View style={styles.queueItemWrapper}>
          <QueueItem
            item={item}
            isCurrentVideo={isCurrentVideo}
            onPress={onVideoPress}
            onRemove={onVideoRemove}
            isDark={isDark}
          />
        </View>

        {/* Drag handle - seulement si ce n'est pas la vidéo actuelle */}
        {!isCurrentVideo && (
          <TouchableOpacity
            onPressIn={drag}
            disabled={isActive}
            style={[
              styles.dragHandle,
              { backgroundColor: colors.background.secondary }
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="reorder-three-outline"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <DraggableFlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={({ data }) => onVideoReorder?.(data)}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        activationDistance={5} // Distance pour activer le drag
        dragHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Zone de hit pour le drag
        dragItemOverflow={true} // Permet aux éléments de sortir des limites pendant le drag
        autoscrollThreshold={100} // Seuil pour l'auto-scroll
        autoscrollSpeed={100} // Vitesse d'auto-scroll
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 300, // Limite la hauteur pour permettre le scroll
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dragging: {
    opacity: 0.9,
    transform: [{ scale: 1.02 }],
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  queueItemWrapper: {
    flex: 1,
    marginRight: 40, // Espace pour le drag handle
  },
  dragHandle: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  currentVideoContainer: {
    opacity: 0.6, // Indique qu'on ne peut pas déplacer la vidéo en cours
  },
  lastItem: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 100,
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});