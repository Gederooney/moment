import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YouTubePlayerComponent, YouTubePlayerHandle } from '../../components/YouTubePlayer';
import { VideoState } from '../../types/moment';

interface PlayerVideoProps {
  videoId: string;
  videoHeight: number;
  seekToTime?: number;
  onStateChange: (state: VideoState) => void;
  onVideoEnd: () => void;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
}

export function PlayerVideo({
  videoId,
  videoHeight,
  seekToTime,
  onStateChange,
  onVideoEnd,
  playerRef,
}: PlayerVideoProps) {
  return (
    <View
      style={[
        styles.container,
        {
          height: videoHeight,
        },
      ]}
    >
      <YouTubePlayerComponent
        ref={playerRef}
        videoId={videoId}
        onStateChange={onStateChange}
        onVideoEnd={onVideoEnd}
        seekToTime={seekToTime}
        autoplay={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
