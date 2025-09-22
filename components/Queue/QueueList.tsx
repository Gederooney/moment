/**
 * QueueList Component
 * Horizontal scrollable list of video items with empty state
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { QueueItem, QueueVideoItem } from './QueueItem';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface QueueListProps {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  onVideoPress: (video: QueueVideoItem) => void;
  onVideoRemove?: (video: QueueVideoItem) => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const QueueList: React.FC<QueueListProps> = ({
  videos,
  currentVideoId,
  onVideoPress,
  onVideoRemove,
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

  return (
    <View style={[styles.container, style]}>
      {videos.map((video, index) => (
        <QueueItem
          key={`${video.id}-${index}`}
          item={video}
          isCurrentVideo={video.id === currentVideoId}
          onPress={onVideoPress}
          onRemove={onVideoRemove}
          isDark={isDark}
          style={index === videos.length - 1 ? styles.lastItem : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  lastItem: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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