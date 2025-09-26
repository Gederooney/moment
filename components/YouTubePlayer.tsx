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

export const YouTubePlayerComponent = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoId, onStateChange, onVideoEnd, seekToTime, autoplay = false }, ref) => {
    const playerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        getCurrentTime: async () => {
          if (playerRef.current && isReady) {
            try {
              const time = await playerRef.current.getCurrentTime();

              return time || 0;
            } catch (error) {
              return currentTime; // Fallback to state current time
            }
          }
          return currentTime; // Fallback to state current time
        },
        seekTo: (time: number, allowSeekAhead?: boolean) => {
          if (playerRef.current && isReady) {
            playerRef.current.seekTo(time, allowSeekAhead);
          }
        },
        playVideo: () => {
          if (playerRef.current && isReady) {
            // The react-native-youtube-iframe doesn't expose direct play/pause methods
            // Instead, we can trigger state change through the component's play prop
            // For now, we just update the state - the actual control should be done
            // through the YouTube player's native controls
          }
        },
        pauseVideo: () => {
          if (playerRef.current && isReady) {
            // The react-native-youtube-iframe doesn't expose direct play/pause methods
            // Instead, users should use the native YouTube player controls
          }
        },
      }),
      [isReady, currentTime]
    );

    // Track if we've already seeked to avoid infinite loops
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

        // Perform the seek
        playerRef.current.seekTo(seekToTime, true);

        // Reset the processing flag after seek is done
        setTimeout(() => {
          lastSeekTimeRef.current = undefined;
          hasProcessedSeekRef.current = false;
        }, 2000);
      }
    }, [seekToTime, isReady]);

    // CRITICAL FIX: Use useRef to track previous state and only call onStateChange when needed
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

      // Only call onStateChange if something important actually changed
      const playingChanged = prevStateRef.current.isPlaying !== newState.isPlaying;
      const readyChanged = prevStateRef.current.isReady !== newState.isReady;
      const durationChanged = prevStateRef.current.duration !== newState.duration;
      const timeChanged = Math.abs(prevStateRef.current.currentTime - newState.currentTime) > 2; // Only if time diff > 2 sec

      const hasChanged = playingChanged || readyChanged || durationChanged || timeChanged;

      if (hasChanged) {
        prevStateRef.current = { ...newState }; // Create a copy to avoid reference issues
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
          // Call onVideoEnd callback when video finishes
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
            rel: 0, // Pas de vidéos suggérées à la fin
            modestbranding: 1, // Branding YouTube minimal
            showinfo: 0, // Pas d'infos sur la vidéo
            iv_load_policy: 3, // Pas d'annotations
            controls: 1, // Contrôles affichés
            disablekb: 0, // Raccourcis clavier activés
            fs: 1, // Plein écran autorisé
            playsinline: 1, // Lecture inline sur mobile
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
