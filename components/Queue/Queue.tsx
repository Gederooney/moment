/**
 * Queue Component
 * Complete video queue component that combines all sub-components
 * Ready-to-use component for the main app
 */

import React, { useState } from 'react';
import { ViewStyle } from 'react-native';
import { QueueContainer } from './QueueContainer';
import { QueueHeader } from './QueueHeader';
import { QueueList } from './QueueList';
import { AddVideoModal } from './AddVideoModal';
import { QueueVideoItem } from './QueueItem';

interface QueueProps {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  onVideoPress: (video: QueueVideoItem) => void;
  onAddVideo: (url: string) => Promise<void> | void;
  onVideoRemove?: (video: QueueVideoItem) => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const Queue: React.FC<QueueProps> = ({
  videos,
  currentVideoId,
  onVideoPress,
  onAddVideo,
  onVideoRemove,
  isDark = true,
  style,
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

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

  return (
    <>
      <QueueContainer isDark={isDark} style={style}>
        <QueueHeader
          queueCount={videos.length}
          onAddPress={handleAddPress}
          isDark={isDark}
        />
        <QueueList
          videos={videos}
          currentVideoId={currentVideoId}
          onVideoPress={onVideoPress}
          onVideoRemove={onVideoRemove}
          isDark={isDark}
        />
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

// Export the combined component as default
export default Queue;