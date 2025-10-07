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
  const [animatedRotation] = useState(new Animated.Value(0));

  const colors = getColors(isDark);

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

    Animated.timing(animatedRotation, {
      toValue: newExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      <QueueContainer isDark={isDark} style={style}>
        {/* Collapsible Header - Wireframe 2 */}
        <View style={styles.collapsibleHeader}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={toggleExpanded}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              File de lecture
            </Text>
            <Animated.View
              style={[styles.chevronContainer, { transform: [{ rotate: rotateInterpolation }] }]}
            >
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Collapsible Content - Hauteur dynamique sans limite */}
        {isExpanded && (
          <View style={styles.collapsibleContent}>
            <QueueList
              videos={videos}
              currentVideoId={currentVideoId}
              onVideoPress={onVideoPress}
              onVideoRemove={onVideoRemove}
              onVideoReorder={onVideoReorder}
              isDark={isDark}
            />
          </View>
        )}
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
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronContainer: {
    padding: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  collapsibleContent: {
    // Pas de limite de hauteur - prend tout l'espace nécessaire
  },
});

// Export the combined component as default
export default Queue;
