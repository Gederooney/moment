/**
 * YouTube Player Wrapper
 * Wraps existing YouTubeIframe with unified interface
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export interface YouTubePlayerRef {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
}

interface YouTubePlayerWrapperProps {
  videoId: string;
  onReady?: () => void;
  onTimeUpdate?: (data: { currentTime: number; duration: number }) => void;
  onStateChange?: (state: 'playing' | 'paused' | 'ended' | 'buffering') => void;
  height?: number;
  initialPlayerParams?: any;
}

export const YouTubePlayerWrapper = forwardRef<YouTubePlayerRef, YouTubePlayerWrapperProps>(
  (
    { videoId, onReady, onTimeUpdate, onStateChange, height = 250, initialPlayerParams },
    ref
  ) => {
    const playerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => {
        if (playerRef.current) {
          return await playerRef.current.getCurrentTime();
        }
        return 0;
      },
      seekTo: async (seconds: number) => {
        if (playerRef.current) {
          await playerRef.current.seekTo(seconds, true);
        }
      },
      play: async () => {
        // YouTube iframe doesn't expose play/pause directly
        // User must interact with player
      },
      pause: async () => {
        // YouTube iframe doesn't expose play/pause directly
        // User must interact with player
      },
    }));

    const handleReady = () => {
      console.log('[YouTubePlayer] Ready');
      onReady?.();
    };

    const handleStateChange = (state: string) => {
      console.log('[YouTubePlayer] State:', state);

      switch (state) {
        case 'playing':
          onStateChange?.('playing');
          break;
        case 'paused':
          onStateChange?.('paused');
          break;
        case 'ended':
          onStateChange?.('ended');
          break;
        case 'buffering':
          onStateChange?.('buffering');
          break;
      }
    };

    return (
      <View style={[styles.container, { height }]}>
        <YoutubePlayer
          ref={playerRef}
          height={height}
          videoId={videoId}
          onReady={handleReady}
          onChangeState={handleStateChange}
          initialPlayerParams={initialPlayerParams}
        />
      </View>
    );
  }
);

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
});
