import React from 'react';
import { Queue } from '../../components/Queue/Queue';
import { QueueVideoItem } from '../../components/Queue/QueueItem';

interface PlayerQueueProps {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  onVideoPress: (video: QueueVideoItem) => void;
  onAddVideo: (url: string) => Promise<void>;
  onVideoRemove: (video: QueueVideoItem) => void;
  onVideoReorder: (newOrder: QueueVideoItem[]) => void;
  isDark: boolean;
}

export function PlayerQueue({
  videos,
  currentVideoId,
  onVideoPress,
  onAddVideo,
  onVideoRemove,
  onVideoReorder,
  isDark,
}: PlayerQueueProps) {
  return (
    <Queue
      videos={videos}
      currentVideoId={currentVideoId}
      onVideoPress={onVideoPress}
      onAddVideo={onAddVideo}
      onVideoRemove={onVideoRemove}
      onVideoReorder={onVideoReorder}
      isDark={isDark}
    />
  );
}
