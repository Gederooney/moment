/**
 * Unified Video Player
 * Automatically detects platform and uses appropriate player
 * Supports: YouTube, Vimeo, Twitch
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseVideoUrl, VideoPlatform } from '../../utils/videoUrl';
import { YouTubePlayerWrapper, YouTubePlayerRef } from './YouTubePlayerWrapper';
import { VimeoPlayer, VimeoPlayerRef } from './VimeoPlayer';
import { TwitchPlayer, TwitchPlayerRef } from './TwitchPlayer';
import { Colors } from '../../constants/Colors';

export interface UnifiedVideoPlayerRef {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
}

interface UnifiedVideoPlayerProps {
  videoUrl: string;
  onReady?: () => void;
  onTimeUpdate?: (data: { currentTime: number; duration: number }) => void;
  onStateChange?: (state: 'playing' | 'paused' | 'ended' | 'buffering') => void;
  height?: number;
  twitchParentDomain?: string;
  initialPlayerParams?: any;
}

export const UnifiedVideoPlayer = forwardRef<UnifiedVideoPlayerRef, UnifiedVideoPlayerProps>(
  (
    {
      videoUrl,
      onReady,
      onTimeUpdate,
      onStateChange,
      height = 250,
      twitchParentDomain = 'localhost',
      initialPlayerParams,
    },
    ref
  ) => {
    const youtubeRef = useRef<YouTubePlayerRef>(null);
    const vimeoRef = useRef<VimeoPlayerRef>(null);
    const twitchRef = useRef<TwitchPlayerRef>(null);

    // Parse URL to detect platform
    const videoInfo = parseVideoUrl(videoUrl);

    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => {
        if (!videoInfo) return 0;

        switch (videoInfo.platform) {
          case 'youtube':
            return youtubeRef.current?.getCurrentTime() || 0;
          case 'vimeo':
            return vimeoRef.current?.getCurrentTime() || 0;
          case 'twitch':
            return twitchRef.current?.getCurrentTime() || 0;
          default:
            return 0;
        }
      },
      seekTo: async (seconds: number) => {
        if (!videoInfo) return;

        switch (videoInfo.platform) {
          case 'youtube':
            await youtubeRef.current?.seekTo(seconds);
            break;
          case 'vimeo':
            await vimeoRef.current?.seekTo(seconds);
            break;
          case 'twitch':
            await twitchRef.current?.seekTo(seconds);
            break;
        }
      },
      play: async () => {
        if (!videoInfo) return;

        switch (videoInfo.platform) {
          case 'youtube':
            await youtubeRef.current?.play();
            break;
          case 'vimeo':
            await vimeoRef.current?.play();
            break;
          case 'twitch':
            await twitchRef.current?.play();
            break;
        }
      },
      pause: async () => {
        if (!videoInfo) return;

        switch (videoInfo.platform) {
          case 'youtube':
            await youtubeRef.current?.pause();
            break;
          case 'vimeo':
            await vimeoRef.current?.pause();
            break;
          case 'twitch':
            await twitchRef.current?.pause();
            break;
        }
      },
    }));

    // If URL is invalid
    if (!videoInfo) {
      return (
        <View style={[styles.container, styles.errorContainer, { height }]}>
          <Text style={styles.errorText}>
            URL vidéo non valide ou plateforme non supportée
          </Text>
          <Text style={styles.errorSubtext}>
            Plateformes supportées: YouTube, Vimeo, Twitch
          </Text>
        </View>
      );
    }

    // Render appropriate player based on platform
    switch (videoInfo.platform) {
      case 'youtube':
        return (
          <YouTubePlayerWrapper
            ref={youtubeRef}
            videoId={videoInfo.videoId}
            onReady={onReady}
            onTimeUpdate={onTimeUpdate}
            onStateChange={onStateChange}
            height={height}
            initialPlayerParams={initialPlayerParams}
          />
        );

      case 'vimeo':
        return (
          <VimeoPlayer
            ref={vimeoRef}
            videoId={videoInfo.videoId}
            onReady={onReady}
            onTimeUpdate={onTimeUpdate}
            onStateChange={onStateChange}
            height={height}
          />
        );

      case 'twitch':
        return (
          <TwitchPlayer
            ref={twitchRef}
            videoId={videoInfo.videoId}
            parentDomain={twitchParentDomain}
            onReady={onReady}
            onTimeUpdate={onTimeUpdate}
            onStateChange={onStateChange}
            height={height}
          />
        );

      default:
        return (
          <View style={[styles.container, styles.errorContainer, { height }]}>
            <Text style={styles.errorText}>Plateforme non supportée</Text>
          </View>
        );
    }
  }
);

UnifiedVideoPlayer.displayName = 'UnifiedVideoPlayer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
