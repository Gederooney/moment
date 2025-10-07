/**
 * Twitch Player Component
 * Uses WebView with Twitch embed iframe
 */

import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface TwitchPlayerRef {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
}

interface TwitchPlayerProps {
  videoId: string;
  parentDomain?: string; // Your domain for parent parameter
  onReady?: () => void;
  onTimeUpdate?: (data: { currentTime: number; duration: number }) => void;
  onStateChange?: (state: 'playing' | 'paused' | 'ended' | 'buffering') => void;
  height?: number;
}

export const TwitchPlayer = forwardRef<TwitchPlayerRef, TwitchPlayerProps>(
  (
    {
      videoId,
      parentDomain = 'localhost',
      onReady,
      onTimeUpdate,
      onStateChange,
      height = 250,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isVideo, setIsVideo] = useState(false);

    // Detect if videoId is a VOD (numeric) or channel (alphanumeric)
    const isVOD = /^\d+$/.test(videoId);

    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => {
        return currentTime;
      },
      seekTo: async (seconds: number) => {
        if (webViewRef.current && isVideo) {
          webViewRef.current.injectJavaScript(`
            if (window.twitchPlayer) {
              window.twitchPlayer.seek(${seconds});
            }
            true;
          `);
        }
      },
      play: async () => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.twitchPlayer) {
              window.twitchPlayer.play();
            }
            true;
          `);
        }
      },
      pause: async () => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.twitchPlayer) {
              window.twitchPlayer.pause();
            }
            true;
          `);
        }
      },
    }));

    const generateHTML = () => {
      const embedUrl = isVOD
        ? `https://player.twitch.tv/?video=${videoId}&parent=${parentDomain}&autoplay=false`
        : `https://player.twitch.tv/?channel=${videoId}&parent=${parentDomain}&autoplay=false`;

      return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { overflow: hidden; background: #000; }
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe
    src="${embedUrl}"
    allowfullscreen
    allow="autoplay; fullscreen"
  ></iframe>

  <script src="https://player.twitch.tv/js/embed/v1.js"></script>
  <script>
    let player;
    let timeUpdateInterval;

    window.onload = function() {
      // Wait for Twitch player to be available
      setTimeout(() => {
        try {
          player = new Twitch.Player("twitch-embed", {
            ${isVOD ? `video: "${videoId}"` : `channel: "${videoId}"`},
            parent: ["${parentDomain}"],
            autoplay: false,
            width: "100%",
            height: "100%"
          });

          window.twitchPlayer = player;

          player.addEventListener(Twitch.Player.READY, function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ready'
            }));

            // Start time update interval for VODs
            ${
              isVOD
                ? `
            timeUpdateInterval = setInterval(() => {
              const currentTime = player.getCurrentTime();
              const duration = player.getDuration();
              if (currentTime !== undefined && duration !== undefined) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'timeupdate',
                  currentTime: currentTime,
                  duration: duration
                }));
              }
            }, 250);
            `
                : ''
            }
          });

          player.addEventListener(Twitch.Player.PLAY, function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'stateChange',
              state: 'playing'
            }));
          });

          player.addEventListener(Twitch.Player.PAUSE, function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'stateChange',
              state: 'paused'
            }));
          });

          player.addEventListener(Twitch.Player.ENDED, function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'stateChange',
              state: 'ended'
            }));
            if (timeUpdateInterval) clearInterval(timeUpdateInterval);
          });
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      }, 1000);
    };
  </script>

  <div id="twitch-embed"></div>
</body>
</html>
      `;
    };

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'ready':
            console.log('[TwitchPlayer] Ready');
            setIsVideo(isVOD);
            onReady?.();
            break;

          case 'timeupdate':
            if (data.currentTime !== undefined) {
              setCurrentTime(data.currentTime);
              onTimeUpdate?.({
                currentTime: data.currentTime,
                duration: data.duration || 0,
              });
            }
            break;

          case 'stateChange':
            console.log('[TwitchPlayer] State:', data.state);
            onStateChange?.(data.state);
            break;

          case 'error':
            console.error('[TwitchPlayer] Error:', data.error);
            break;
        }
      } catch (error) {
        console.error('[TwitchPlayer] Error parsing message:', error);
      }
    };

    return (
      <View style={[styles.container, { height }]}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML() }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleMessage}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
        />
      </View>
    );
  }
);

TwitchPlayer.displayName = 'TwitchPlayer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
