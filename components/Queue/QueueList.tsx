/**
 * QueueList Component
 * Horizontal scrollable list of video items with empty state
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
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
    return <View style={[styles.container, style]}>{renderEmptyState()}</View>;
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueVideoItem>) => {
    const isCurrentVideo = item.id === currentVideoId;

    return (
      <View
        style={[
          styles.itemContainer,
          isActive && styles.dragging,
        ]}
      >
        <QueueItem
          item={item}
          isCurrentVideo={isCurrentVideo}
          onPress={onVideoPress}
          onLongPress={!isCurrentVideo ? drag : undefined}
          onRemove={onVideoRemove}
          isDark={isDark}
          isDragging={isActive}
        />
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
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={false}
        activationDistance={5}
        dragHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        dragItemOverflow={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  itemContainer: {
    width: '100%',
  },
  dragging: {
    opacity: 0.95,
    transform: [{ scale: 1.05 }],
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    // Shadow pour iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  lastItem: {
    marginBottom: 0,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 40,
    paddingVertical: 8,
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
