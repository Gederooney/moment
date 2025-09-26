/**
 * Queue Component
 * Complete video queue component that combines all sub-components
 * Ready-to-use component for the main app
 */

import React, { useState } from 'react';
import {
  ViewStyle,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueueContainer } from './QueueContainer';
import { QueueList } from './QueueList';
import { AddVideoModal } from './AddVideoModal';
import { QueueVideoItem } from './QueueItem';
import { getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface QueueProps {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  onVideoPress: (video: QueueVideoItem) => void;
  onAddVideo: (url: string) => Promise<void> | void;
  onVideoRemove?: (video: QueueVideoItem) => void;
  onVideoReorder?: (newOrder: QueueVideoItem[]) => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const Queue: React.FC<QueueProps> = ({
  videos,
  currentVideoId,
  onVideoPress,
  onAddVideo,
  onVideoRemove,
  onVideoReorder,
  isDark = true,
  style,
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [animatedHeight] = useState(new Animated.Value(1));
  const [animatedRotation] = useState(new Animated.Value(0));

  const colors = getColors(isDark);
  const screenHeight = Dimensions.get('window').height;
  const maxQueueHeight = Math.min(300, screenHeight * 0.4);

  const handleAddPress = () => {
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
  };

  const handleAddVideoConfirm = async (url: string) => {
    await onAddVideo(url);
    setIsAddModalVisible(false);
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: newExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: newExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const heightInterpolation = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxQueueHeight],
  });

  return (
    <>
      <QueueContainer isDark={isDark} style={style}>
        {/* Collapsible Header */}
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              File d'attente ({videos.length})
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={e => {
                e.stopPropagation();
                handleAddPress();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={colors.text.white} />
            </TouchableOpacity>

            <Animated.View
              style={[styles.chevronContainer, { transform: [{ rotate: rotateInterpolation }] }]}
            >
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Collapsible Content */}
        <Animated.View style={[styles.collapsibleContent, { height: heightInterpolation }]}>
          <QueueList
            videos={videos}
            currentVideoId={currentVideoId}
            onVideoPress={onVideoPress}
            onVideoRemove={onVideoRemove}
            onVideoReorder={onVideoReorder}
            isDark={isDark}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </QueueContainer>

      <AddVideoModal
        visible={isAddModalVisible}
        onClose={handleModalClose}
        onAddVideo={handleAddVideoConfirm}
        isDark={isDark}
      />
    </>
  );
};

const styles = StyleSheet.create({
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainer: {
    padding: 2,
  },
  collapsibleContent: {
    overflow: 'hidden',
  },
});

// Export the combined component as default
export default Queue;
