import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../constants/Colors';
import { YouTubePlayerComponent, YouTubePlayerHandle } from '../components/YouTubePlayer';
import { CaptureButton } from '../components/CaptureButton';
import { MomentsList } from '../components/MomentsList';
import { Queue } from '../components/Queue/Queue';
import { QueueVideoItem } from '../components/Queue/QueueItem';
import { useMomentsContext } from '../contexts/MomentsContext';
import { useTopBarContext } from '../contexts/TopBarContext';
import { extractVideoId, getVideoTitle } from '../utils/youtube';
import { fetchYouTubeMetadataWithFallback } from '../services/youtubeMetadata';
import { formatTime } from '../utils/time';
import { VideoState } from '../types/moment';

// Simple playlist interface
interface SimplePlaylist {
  id: string;
  name: string;
  videos: {
    id: string;
    url: string;
    title: string;
    videoId: string;
    thumbnail?: string;
    author?: string;
  }[];
  currentIndex: number;
}

const SIMPLE_PLAYLIST_KEY = '@podcut_simple_playlist';

export default function PlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const playerRef = useRef<YouTubePlayerHandle>(null);

  // Extract params
  const videoId = params.videoId as string;
  const timestamp = params.timestamp ? parseFloat(params.timestamp as string) : undefined;
  const title = params.title as string;
  const author = params.author as string;
  const thumbnail = params.thumbnail as string;
  const url = params.url as string;
  const isFromApi = params.isFromApi === 'true';

  const [videoTitle, setVideoTitle] = useState<string>(title || '');
  const [videoAuthor, setVideoAuthor] = useState<string>(author || '');
  const [videoThumbnail, setVideoThumbnail] = useState<string>(thumbnail || '');
  const [metadataLoaded, setMetadataLoaded] = useState<boolean>(isFromApi || false);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isReady: false,
  });
  const [seekToTime, setSeekToTime] = useState<number | undefined>(timestamp);
  const isSeekingRef = useRef(false);
  const [isDark, setIsDark] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Simple playlist state
  const [simplePlaylist, setSimplePlaylist] = useState<SimplePlaylist>({
    id: 'playlist-1',
    name: 'Playlist 1',
    videos: [],
    currentIndex: 0,
  });
  // Removed unused playlist UI state variables
  // Note: isEditingPlaylistName, tempPlaylistName, showAddVideoModal, newVideoUrl, isLoadingVideo removed

  const colors = getColors(isDark);

  // Load simple playlist from storage
  useEffect(() => {
    loadSimplePlaylist();
  }, []);

  // Save simple playlist to storage
  useEffect(() => {
    saveSimplePlaylist();
  }, [simplePlaylist]);

  const loadSimplePlaylist = async () => {
    try {
      const stored = await AsyncStorage.getItem(SIMPLE_PLAYLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSimplePlaylist(parsed);
      }
    } catch (error) {
      console.error('Error loading simple playlist:', error);
    }
  };

  const saveSimplePlaylist = async () => {
    try {
      await AsyncStorage.setItem(SIMPLE_PLAYLIST_KEY, JSON.stringify(simplePlaylist));
    } catch (error) {
      console.error('Error saving simple playlist:', error);
    }
  };

  // Écoute des changements de dimensions d'écran
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calcul dynamique de la hauteur de la vidéo
  const getVideoHeight = useMemo(() => {
    const { width, height } = screenData;
    const isLandscape = width > height;
    const videoWidth = width;
    const idealHeight = videoWidth * (9 / 16); // Ratio 16:9

    // Limites adaptatives
    const maxHeight = isLandscape ? height * 0.4 : height * 0.3;
    const minHeight = isLandscape ? 150 : 180;

    return Math.max(minHeight, Math.min(idealHeight, maxHeight));
  }, [screenData]);

  // Context hooks
  const {
    captureMoment: captureFromContext,
    getMomentsForVideo,
    deleteMomentFromVideo,
    getVideoById,
  } = useMomentsContext();

  const {
    setVideoState: setTopBarVideoState,
    clearVideoState,
    registerBackNavigation,
    setTitle,
  } = useTopBarContext();

  // Get moments for this video
  const moments = useMemo(() => {
    return videoId ? getMomentsForVideo(videoId) : [];
  }, [videoId, getMomentsForVideo]);

  // Set video state in TopBar
  useEffect(() => {
    if (videoId && videoTitle) {
      setTopBarVideoState(videoId, videoTitle);
    }
  }, [videoId, videoTitle, setTopBarVideoState]);

  // Set title in TopBar
  useEffect(() => {
    if (videoTitle) {
      setTitle(videoTitle);
    } else {
      setTitle('Lecteur Vidéo');
    }
  }, [videoTitle, setTitle]);

  // Load video metadata if not provided
  useEffect(() => {
    const loadMetadata = async () => {
      if (videoId && (!videoTitle || !metadataLoaded)) {
        const existingVideo = getVideoById(videoId);
        if (existingVideo) {
          setVideoTitle(existingVideo.title);
          // Essayer de récupérer les métadonnées enrichies si pas déjà fait
          if (!metadataLoaded && url) {
            try {
              const metadata = await fetchYouTubeMetadataWithFallback(url, videoId);
              setVideoTitle(metadata.title);
              setVideoAuthor(metadata.author_name);
              setVideoThumbnail(metadata.thumbnail_url);
              setMetadataLoaded(true);
            } catch (error) {
              console.warn('Failed to load enriched metadata:', error);
            }
          }
        } else if (url) {
          try {
            const metadata = await fetchYouTubeMetadataWithFallback(url, videoId);
            setVideoTitle(metadata.title);
            setVideoAuthor(metadata.author_name);
            setVideoThumbnail(metadata.thumbnail_url);
            setMetadataLoaded(true);
          } catch (error) {
            console.warn('Failed to load metadata, using fallback:', error);
            const extractedTitle = getVideoTitle(url) || `Vidéo YouTube ${videoId}`;
            setVideoTitle(extractedTitle);
          }
        }
      }
    };

    loadMetadata();
  }, [videoId, videoTitle, metadataLoaded, url, getVideoById]);

  // Handle back navigation
  const handleBackNavigation = useCallback(() => {
    router.back();
  }, [router]);

  // Register back navigation
  useEffect(() => {
    const cleanup = registerBackNavigation(handleBackNavigation);
    return cleanup;
  }, [registerBackNavigation, handleBackNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearVideoState();
    };
  }, [clearVideoState]);

  // Get current video info for playlist display
  const getCurrentVideoInPlaylist = () => {
    const currentVideoIndex = simplePlaylist.videos.findIndex(v => v.videoId === videoId);
    if (currentVideoIndex !== -1 && currentVideoIndex !== simplePlaylist.currentIndex) {
      setSimplePlaylist(prev => ({ ...prev, currentIndex: currentVideoIndex }));
    }
    return currentVideoIndex;
  };

  // Get video status for queue UI
  const getVideoStatus = (index: number) => {
    if (index === simplePlaylist.currentIndex) {
      return videoState.isPlaying ? 'playing' : 'paused';
    }
    return 'queued';
  };

  // Queue data for new components - format compatible with QueueVideoItem interface
  const queueData: QueueVideoItem[] = simplePlaylist.videos.map((video) => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail || '',
    duration: undefined, // Will be filled by the queue component if needed
    channelName: video.author || undefined,
  }));

  // Obtenir l'ID de la vidéo actuellement en cours
  const getCurrentVideoId = () => {
    // Retourner l'ID de la vidéo actuellement jouée (depuis les params)
    // et non pas celle de la playlist
    // Chercher dans la playlist si la vidéo actuelle y est
    const currentVideoInPlaylist = simplePlaylist.videos.find(v => v.videoId === videoId);
    return currentVideoInPlaylist?.id || undefined;
  };

  useEffect(() => {
    getCurrentVideoInPlaylist();
  }, [videoId]);

  const handleVideoStateChange = useCallback((state: VideoState) => {
    console.log('Video state changed:', state);
    setVideoState(state);

    // Reset seekToTime when player is ready and we have a pending seek
    if (state.isReady && seekToTime !== undefined && !isSeekingRef.current) {
      setTimeout(() => {
        console.log('Clearing seekToTime after player ready');
        setSeekToTime(undefined);
        isSeekingRef.current = false;
      }, 1000);
    }
  }, [seekToTime]);

  // Simple playlist functions
  const addVideo = useCallback((videoData?: { videoId: string; title: string; url: string; thumbnail?: string; author?: string }) => {
    const data = videoData || {
      videoId: videoId!,
      title: videoTitle,
      url: url || `https://youtube.com/watch?v=${videoId}`,
      thumbnail: videoThumbnail,
      author: videoAuthor,
    };

    if (!data.videoId || !data.title) return;

    const newVideo = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      url: data.url,
      title: data.title,
      videoId: data.videoId,
      thumbnail: data.thumbnail,
      author: data.author,
    };

    setSimplePlaylist(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));

    return newVideo.id;
  }, [videoId, videoTitle, url, videoThumbnail, videoAuthor]);

  // Kept for future use - allows adding current video to playlist
  const addCurrentVideoToPlaylist = useCallback(() => {
    const id = addVideo();
    if (id) {
      Alert.alert('Ajouté', 'Vidéo ajoutée à la playlist');
    }
  }, [addVideo]);

  const addVideoByUrl = useCallback(async (videoUrl: string) => {
    if (!videoUrl.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une URL valide');
      return;
    }

    try {
      const extractedVideoId = extractVideoId(videoUrl);
      if (!extractedVideoId) {
        Alert.alert('Erreur', 'URL YouTube invalide');
        return;
      }

      const metadata = await fetchYouTubeMetadataWithFallback(videoUrl, extractedVideoId);
      const newVideo = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        url: videoUrl,
        title: metadata.title,
        videoId: extractedVideoId,
        thumbnail: metadata.thumbnail_url,
        author: metadata.author_name,
      };

      setSimplePlaylist(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }));

      Alert.alert('Ajouté', 'Vidéo ajoutée à la playlist');
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter cette vidéo');
      throw error; // Re-throw pour que le composant Queue puisse gérer l'erreur
    }
  }, []);

  const removeVideo = useCallback((videoId: string) => {
    setSimplePlaylist(prev => {
      const newVideos = prev.videos.filter(v => v.id !== videoId);
      let newCurrentIndex = prev.currentIndex;

      // Adjust current index if needed
      const removedIndex = prev.videos.findIndex(v => v.id === videoId);
      if (removedIndex !== -1 && removedIndex <= prev.currentIndex && prev.currentIndex > 0) {
        newCurrentIndex = prev.currentIndex - 1;
      }

      return {
        ...prev,
        videos: newVideos,
        currentIndex: Math.max(0, Math.min(newCurrentIndex, newVideos.length - 1)),
      };
    });
  }, []);

  const playVideo = useCallback((index: number) => {
    const video = simplePlaylist.videos[index];
    if (!video) return;

    setSimplePlaylist(prev => ({ ...prev, currentIndex: index }));

    // Update route params to change the video without navigation
    router.setParams({
      videoId: video.videoId,
      title: video.title,
      author: video.author || '',
      thumbnail: video.thumbnail || '',
      url: video.url,
      isFromApi: 'true',
    });

    // Update local state and TopBar title
    setVideoTitle(video.title);
    setVideoAuthor(video.author || '');
    setVideoThumbnail(video.thumbnail || '');
    setTitle(video.title);
    setTopBarVideoState(video.videoId, video.title);
  }, [simplePlaylist.videos, router, setTitle, setTopBarVideoState]);

  // Kept for future use - allows reordering videos in playlist
  const moveVideo = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= simplePlaylist.videos.length) {
      return;
    }

    setSimplePlaylist(prev => {
      const newVideos = [...prev.videos];
      const [movedVideo] = newVideos.splice(fromIndex, 1);
      newVideos.splice(toIndex, 0, movedVideo);

      let newCurrentIndex = prev.currentIndex;
      if (prev.currentIndex === fromIndex) {
        newCurrentIndex = toIndex;
      } else if (fromIndex < prev.currentIndex && toIndex >= prev.currentIndex) {
        newCurrentIndex = prev.currentIndex - 1;
      } else if (fromIndex > prev.currentIndex && toIndex <= prev.currentIndex) {
        newCurrentIndex = prev.currentIndex + 1;
      }

      return { ...prev, videos: newVideos, currentIndex: newCurrentIndex };
    });
  }, [simplePlaylist.videos.length]);

  // Kept for future use - allows renaming playlist
  const updatePlaylistName = useCallback((newName: string) => {
    setSimplePlaylist(prev => ({ ...prev, name: newName.trim() || 'Playlist 1' }));
  }, []);

  const playNext = useCallback(() => {
    const nextIndex = simplePlaylist.currentIndex + 1;
    if (nextIndex < simplePlaylist.videos.length) {
      playVideo(nextIndex);
    }
  }, [simplePlaylist.currentIndex, simplePlaylist.videos.length, playVideo]);

  // Kept for future use - allows playing previous video in playlist
  const playPrevious = useCallback(() => {
    const prevIndex = simplePlaylist.currentIndex - 1;
    if (prevIndex >= 0) {
      playVideo(prevIndex);
    }
  }, [simplePlaylist.currentIndex, playVideo]);

  // Handle video end for simple playlist functionality
  const handleVideoEnd = useCallback(() => {
    if (simplePlaylist.videos.length > 0) {
      const nextIndex = simplePlaylist.currentIndex + 1;
      if (nextIndex < simplePlaylist.videos.length) {
        console.log('Video ended, playing next video from simple playlist');
        playNext();
      }
    }
  }, [simplePlaylist, playNext]);

  // Handler pour la sélection d'une vidéo dans la queue
  const handleQueueVideoPress = useCallback((queueVideo: QueueVideoItem) => {
    const videoIndex = simplePlaylist.videos.findIndex(v => v.id === queueVideo.id);
    if (videoIndex !== -1) {
      playVideo(videoIndex);
    }
  }, [simplePlaylist.videos, playVideo]);

  // Handler pour supprimer une vidéo de la queue
  const handleQueueVideoRemove = useCallback((queueVideo: QueueVideoItem) => {
    removeVideo(queueVideo.id);
  }, [removeVideo]);

  const handleCaptureMoment = async () => {
    if (!videoState.isReady || !videoId || !playerRef.current) {
      console.warn('Video not ready for capture');
      return;
    }

    try {
      // Get current time directly from the player
      const currentTime = await playerRef.current.getCurrentTime();
      console.log('Capturing moment at time:', currentTime);

      // Verify that currentTime is valid
      let timeToCapture = currentTime;
      if (currentTime === undefined || currentTime === null) {
        console.warn('getCurrentTime returned invalid value, using state currentTime:', videoState.currentTime);
        timeToCapture = videoState.currentTime;
      }

      const moment = await captureFromContext(
        videoId,
        timeToCapture,
        30,
        videoTitle || 'Sans titre',
        url || `https://youtube.com/watch?v=${videoId}`,
        videoThumbnail
      );

      console.log(`Moment captured successfully at ${formatTime(timeToCapture)}`);
    } catch (error) {
      console.error('Error capturing moment:', error);
    }
  };

  const handlePlayMoment = (timestamp: number) => {
    // Prevent multiple seeks in quick succession
    if (isSeekingRef.current) {
      console.log('Seek already in progress, ignoring');
      return;
    }

    console.log('Playing moment at:', timestamp);
    isSeekingRef.current = true;

    if (playerRef.current && videoState.isReady) {
      playerRef.current.seekTo(timestamp, true);
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 1000);
    } else {
      setSeekToTime(timestamp);
    }
  };

  const handleDeleteMoment = (momentId: string) => {
    Alert.alert(
      'Supprimer le moment',
      'Êtes-vous sûr de vouloir supprimer ce moment?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!videoId) {
              Alert.alert('Erreur', 'ID de vidéo manquant');
              return;
            }
            try {
              await deleteMomentFromVideo(videoId, momentId);
            } catch (error) {
              console.error('Error deleting moment:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le moment');
            }
          },
        },
      ]
    );
  };

  if (!videoId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.primary }]}>
            ID de vidéo manquant
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Lecteur YouTube en haut - pleine largeur */}
      <View
        style={[
          styles.videoPlayerSection,
          {
            height: getVideoHeight,
          }
        ]}
      >
        <YouTubePlayerComponent
          ref={playerRef}
          videoId={videoId}
          onStateChange={handleVideoStateChange}
          onVideoEnd={handleVideoEnd}
          seekToTime={seekToTime}
          autoplay={true}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Queue Component */}
        {queueData.length > 0 && (
          <View style={styles.queueContainer}>
            <Queue
              videos={queueData}
              currentVideoId={getCurrentVideoId()}
              onVideoPress={handleQueueVideoPress}
              onAddVideo={addVideoByUrl}
              onVideoRemove={handleQueueVideoRemove}
              isDark={isDark}
            />
          </View>
        )}

        {/* Zone des moments */}
        <View style={styles.momentsSection}>
          <ScrollView
            style={styles.momentsScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.momentsContent}
          >
            <View style={styles.momentsContainer}>
              <MomentsList
                moments={moments}
                onPlayMoment={handlePlayMoment}
                onDeleteMoment={handleDeleteMoment}
              />
            </View>
          </ScrollView>
        </View>

        {/* Bouton de capture fixe en bas */}
        <View style={styles.captureButtonContainer}>
          <CaptureButton
            onCapture={handleCaptureMoment}
            disabled={!videoState.isReady}
            currentTime={videoState.currentTime}
            modern={true}
          />
        </View>
      </KeyboardAvoidingView>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Section vidéo - Pleine largeur en haut
  videoPlayerSection: {
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

  keyboardAvoid: {
    flex: 1,
  },

  // Queue container styles
  queueContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  // Section des moments
  momentsSection: {
    flex: 1,
  },

  momentsScrollView: {
    flex: 1,
  },

  momentsContent: {
    paddingBottom: 120, // Espace pour le bouton capture
    paddingTop: 16,
  },

  momentsContainer: {
    paddingHorizontal: 20,
    minHeight: 200,
  },

  // Bouton capture fixe
  captureButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  errorText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});