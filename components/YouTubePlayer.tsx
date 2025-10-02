import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { VideoState } from '../types/moment';
import { Colors } from '../constants/Colors';

interface YouTubePlayerProps {
  videoId: string | null;
  onStateChange: (state: VideoState) => void;
  onVideoEnd?: () => void;
  seekToTime?: number;
  autoplay?: boolean;
}

export interface YouTubePlayerHandle {
  getCurrentTime: () => Promise<number>;
  seekTo: (time: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

const { width } = Dimensions.get('window');
const playerHeight = (width * 9) / 16; // Ratio 16:9

async function safeGetCurrentTime(
  playerRef: React.RefObject<any>,
  isReady: boolean,
  fallbackTime: number
): Promise<number> {
  if (playerRef.current && isReady) {
    try {
      const time = await playerRef.current.getCurrentTime();
      return time || 0;
    } catch (error) {
      return fallbackTime;
    }
  }
  return fallbackTime;
}

function safeSeekTo(
  playerRef: React.RefObject<any>,
  isReady: boolean,
  time: number,
  allowSeekAhead?: boolean
): void {
  if (playerRef.current && isReady) {
    playerRef.current.seekTo(time, allowSeekAhead);
  }
}

function createPlayerHandleMethods(
  playerRef: React.RefObject<any>,
  isReady: boolean,
  currentTime: number
): YouTubePlayerHandle {
  return {
    getCurrentTime: async () => safeGetCurrentTime(playerRef, isReady, currentTime),
    seekTo: (time: number, allowSeekAhead?: boolean) =>
      safeSeekTo(playerRef, isReady, time, allowSeekAhead),
    playVideo: () => {
      // The react-native-youtube-iframe doesn't expose direct play/pause methods
    },
    pauseVideo: () => {
      // The react-native-youtube-iframe doesn't expose direct play/pause methods
    },
  };
}

function hasStateChanged(
  prevState: VideoState,
  newState: VideoState
): boolean {
  const playingChanged = prevState.isPlaying !== newState.isPlaying;
  const readyChanged = prevState.isReady !== newState.isReady;
  const durationChanged = prevState.duration !== newState.duration;
  const timeChanged = Math.abs(prevState.currentTime - newState.currentTime) > 2;

  return playingChanged || readyChanged || durationChanged || timeChanged;
}

export const YouTubePlayerComponent = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoId, onStateChange, onVideoEnd, seekToTime, autoplay = false }, ref) => {
    const playerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useImperativeHandle(
      ref,
      () => createPlayerHandleMethods(playerRef, isReady, currentTime),
      [isReady, currentTime]
    );

    const lastSeekTimeRef = useRef<number | undefined>(undefined);
    const hasProcessedSeekRef = useRef(false);

    useEffect(() => {
      if (
        seekToTime !== undefined &&
        isReady &&
        playerRef.current &&
        seekToTime !== lastSeekTimeRef.current &&
        !hasProcessedSeekRef.current
      ) {
        hasProcessedSeekRef.current = true;
        lastSeekTimeRef.current = seekToTime;
        playerRef.current.seekTo(seekToTime, true);

        setTimeout(() => {
          lastSeekTimeRef.current = undefined;
          hasProcessedSeekRef.current = false;
        }, 2000);
      }
    }, [seekToTime, isReady]);

    const prevStateRef = useRef<VideoState>({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isReady: false,
    });

    useEffect(() => {
      const newState = {
        isPlaying,
        currentTime,
        duration,
        isReady,
      };

      if (hasStateChanged(prevStateRef.current, newState)) {
        prevStateRef.current = { ...newState };
        onStateChange(newState);
      }
    }, [isPlaying, currentTime, duration, isReady, onStateChange]);

    const handleStateChange = (state: string) => {
      switch (state) {
        case 'playing':
          setIsPlaying(true);
          break;
        case 'paused':
          setIsPlaying(false);
          break;
        case 'ended':
          setIsPlaying(false);
          if (onVideoEnd) {
            onVideoEnd();
          }
          break;
      }
    };

    const handleReady = () => {
      setIsReady(true);
      if (playerRef.current) {
        playerRef.current.getDuration().then((dur: number) => {
          setDuration(dur);
        });
      }
    };

    const handleProgress = (data: { currentTime: number }) => {
      const timeDiff = Math.abs(data.currentTime - currentTime);
      if (timeDiff >= 0.5) {
        setCurrentTime(data.currentTime);
      }
    };

    if (!videoId) {
      return (
        <View style={[styles.container, styles.placeholder]}>
          <Text style={styles.placeholderText}>Entrez une URL YouTube pour commencer</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {!isReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Chargement de la vidéo...</Text>
          </View>
        )}
        <YoutubePlayer
          ref={playerRef}
          height={playerHeight}
          width={width}
          videoId={videoId}
          play={autoplay}
          onChangeState={handleStateChange}
          onReady={handleReady}
          onProgress={handleProgress}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          showClosedCaptions={false}
          controls={true}
          webViewStyle={{ opacity: 0.99 }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{
            rel: 0,
            modestbranding: 1,
            showinfo: 0,
            iv_load_policy: 3,
            controls: 1,
            disablekb: 0,
            fs: 1,
            playsinline: 1,
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: playerHeight,
    backgroundColor: Colors.background.dark,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 0,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.white,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  loadingText: {
    color: Colors.text.white,
    marginTop: 10,
    fontSize: 14,
  },
});
