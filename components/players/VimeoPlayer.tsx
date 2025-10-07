/**
 * Vimeo Player Component
 * Wrapper for react-native-vimeo-iframe with unified interface
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Vimeo from 'react-native-vimeo-iframe';

export interface VimeoPlayerRef {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
}

interface VimeoPlayerProps {
  videoId: string;
  onReady?: () => void;
  onTimeUpdate?: (data: { currentTime: number; duration: number }) => void;
  onStateChange?: (state: 'playing' | 'paused' | 'ended' | 'buffering') => void;
  height?: number;
}

export const VimeoPlayer = forwardRef<VimeoPlayerRef, VimeoPlayerProps>(
  ({ videoId, onReady, onTimeUpdate, onStateChange, height = 250 }, ref) => {
    const vimeoRef = useRef<any>(null);
    const currentTimeRef = useRef<number>(0);
    const durationRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => {
        return currentTimeRef.current;
      },
      seekTo: async (seconds: number) => {
        if (vimeoRef.current) {
          await vimeoRef.current.seek(seconds);
        }
      },
      play: async () => {
        if (vimeoRef.current) {
          await vimeoRef.current.play();
        }
      },
      pause: async () => {
        if (vimeoRef.current) {
          await vimeoRef.current.pause();
        }
      },
    }));

    const handleReady = () => {
      console.log('[VimeoPlayer] Ready');
      onReady?.();
    };

    const handlePlaybackStatusUpdate = (data: any) => {
      if (data.currentTime !== undefined) {
        currentTimeRef.current = data.currentTime;
      }
      if (data.duration !== undefined) {
        durationRef.current = data.duration;
      }

      if (onTimeUpdate && data.currentTime !== undefined && data.duration !== undefined) {
        onTimeUpdate({
          currentTime: data.currentTime,
          duration: data.duration,
        });
      }
    };

    const handlePlay = () => {
      console.log('[VimeoPlayer] Playing');
      onStateChange?.('playing');
    };

    const handlePause = () => {
      console.log('[VimeoPlayer] Paused');
      onStateChange?.('paused');
    };

    const handleEnd = () => {
      console.log('[VimeoPlayer] Ended');
      onStateChange?.('ended');
    };

    return (
      <View style={[styles.container, { height }]}>
        <Vimeo
          ref={vimeoRef}
          videoId={videoId}
          params={`api=1&autoplay=0`}
          handlers={{
            ready: handleReady,
            play: handlePlay,
            pause: handlePause,
            ended: handleEnd,
            timeupdate: handlePlaybackStatusUpdate,
          }}
        />
      </View>
    );
  }
);

VimeoPlayer.displayName = 'VimeoPlayer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
});
