import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMomentsContext } from '../../contexts/MomentsContext';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { useSettings } from '../../hooks/useSettings';
import { extractVideoId } from '../../utils/youtube';
import { fetchYouTubeMetadataWithFallback } from '../../services/youtubeMetadata';
import { VideoState } from '../../types/moment';
import { QueueVideoItem } from '../../components/Queue/QueueItem';
import { YouTubePlayerHandle } from '../../components/YouTubePlayer';

export interface SimplePlaylist {
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

function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function calculateVideoHeight(screenData: { width: number; height: number }): number {
  const { width, height } = screenData;
  const isLandscape = width > height;
  const videoWidth = width;
  const idealHeight = videoWidth * (9 / 16);

  const maxHeight = isLandscape ? height * 0.4 : height * 0.25;
  const minHeight = isLandscape ? 150 : 180;

  return Math.max(minHeight, Math.min(idealHeight, maxHeight));
}

function convertToQueueData(videos: SimplePlaylist['videos']): QueueVideoItem[] {
  return videos.map(video => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail || '',
    duration: undefined,
    channelName: video.author || undefined,
  }));
}

async function loadPlaylistFromStorage(): Promise<SimplePlaylist | null> {
  try {
    const stored = await AsyncStorage.getItem(SIMPLE_PLAYLIST_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

async function savePlaylistToStorage(playlist: SimplePlaylist): Promise<void> {
  try {
    await AsyncStorage.setItem(SIMPLE_PLAYLIST_KEY, JSON.stringify(playlist));
  } catch (error) {}
}

function createVideoEntry(
  videoId: string,
  title: string,
  url: string,
  thumbnail?: string,
  author?: string
) {
  return {
    id: generateUniqueId(),
    url: url || `https://youtube.com/watch?v=${videoId}`,
    title: title || `Vidéo ${videoId}`,
    videoId: videoId,
    thumbnail: thumbnail || '',
    author: author || '',
  };
}

function calculateNewCurrentIndex(
  videos: SimplePlaylist['videos'],
  removedIndex: number,
  currentIndex: number
): number {
  let newCurrentIndex = currentIndex;

  if (removedIndex !== -1 && removedIndex <= currentIndex && currentIndex > 0) {
    newCurrentIndex = currentIndex - 1;
  }

  return Math.max(0, Math.min(newCurrentIndex, videos.length - 1));
}

function reorderVideosByQueueItems(
  queueItems: QueueVideoItem[],
  videos: SimplePlaylist['videos']
): SimplePlaylist['videos'] {
  return queueItems
    .map(queueItem => videos.find(v => v.id === queueItem.id))
    .filter(Boolean) as SimplePlaylist['videos'];
}

export function usePlayerState(playerRef: React.RefObject<YouTubePlayerHandle | null>) {
  const params = useLocalSearchParams();
  const router = useRouter();

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

  const [simplePlaylist, setSimplePlaylist] = useState<SimplePlaylist>({
    id: 'playlist-1',
    name: 'Playlist 1',
    videos: [],
    currentIndex: 0,
  });

  const {
    captureMoment: captureFromContext,
    getMomentsForVideo,
    deleteMomentFromVideo,
    getVideoById,
  } = useMomentsContext();

  const { settings } = useSettings();

  const {
    setVideoState: setTopBarVideoState,
    clearVideoState,
    registerBackNavigation,
    setTitle,
  } = useTopBarContext();

  const moments = useMemo(() => {
    return videoId ? getMomentsForVideo(videoId) : [];
  }, [videoId, getMomentsForVideo]);

  const getVideoHeight = useMemo(() => {
    return calculateVideoHeight(screenData);
  }, [screenData]);

  const queueData: QueueVideoItem[] = useMemo(
    () => convertToQueueData(simplePlaylist.videos),
    [simplePlaylist.videos]
  );

  const getCurrentVideoId = useCallback(() => {
    const currentVideoInPlaylist = simplePlaylist.videos.find(v => v.videoId === videoId);
    return currentVideoInPlaylist?.id || undefined;
  }, [simplePlaylist.videos, videoId]);

  const loadPlaylist = useCallback(async () => {
    const stored = await loadPlaylistFromStorage();
    if (stored) {
      setSimplePlaylist(stored);
    }
  }, []);

  const savePlaylist = useCallback(async () => {
    await savePlaylistToStorage(simplePlaylist);
  }, [simplePlaylist]);

  const loadMetadata = useCallback(async () => {
    if (!videoId || (videoTitle && metadataLoaded)) return;

    const existingVideo = getVideoById(videoId);
    if (existingVideo) {
      setVideoTitle(existingVideo.title);
    }

    if (!metadataLoaded && url) {
      try {
        const metadata = await fetchYouTubeMetadataWithFallback(url, videoId);
        setVideoTitle(metadata.title);
        setVideoAuthor(metadata.author_name);
        setVideoThumbnail(metadata.thumbnail_url);
        setMetadataLoaded(true);
      } catch (error) {
        setVideoTitle(`Vidéo YouTube ${videoId}`);
      }
    }
  }, [videoId, videoTitle, metadataLoaded, url, getVideoById]);

  const autoAddToPlaylist = useCallback(() => {
    if (!videoId) return;

    const currentVideoInPlaylist = simplePlaylist.videos.find(v => v.videoId === videoId);
    if (currentVideoInPlaylist) return;

    const titleToUse = videoTitle || title || `Vidéo ${videoId}`;
    const urlToUse = url || `https://youtube.com/watch?v=${videoId}`;

    const newVideo = createVideoEntry(
      videoId,
      titleToUse,
      urlToUse,
      videoThumbnail || thumbnail,
      videoAuthor || author
    );

    setSimplePlaylist(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));
  }, [videoId, videoTitle, title, videoThumbnail, thumbnail, videoAuthor, author, url, simplePlaylist.videos]);

  const updateCurrentIndex = useCallback(() => {
    const currentVideoIndex = simplePlaylist.videos.findIndex(v => v.videoId === videoId);
    if (currentVideoIndex !== -1 && currentVideoIndex !== simplePlaylist.currentIndex) {
      setSimplePlaylist(prev => ({ ...prev, currentIndex: currentVideoIndex }));
    }
  }, [videoId, simplePlaylist.videos, simplePlaylist.currentIndex]);

  const handleVideoStateChange = useCallback(
    (state: VideoState) => {
      setVideoState(state);

      if (state.isReady && seekToTime !== undefined && !isSeekingRef.current) {
        setTimeout(() => {
          setSeekToTime(undefined);
          isSeekingRef.current = false;
        }, 1000);
      }
    },
    [seekToTime]
  );

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
      const newVideo = createVideoEntry(
        extractedVideoId,
        metadata.title,
        videoUrl,
        metadata.thumbnail_url,
        metadata.author_name
      );

      setSimplePlaylist(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }));
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter cette vidéo");
      throw error;
    }
  }, []);

  const removeVideo = useCallback((videoId: string) => {
    setSimplePlaylist(prev => {
      const newVideos = prev.videos.filter(v => v.id !== videoId);
      const removedIndex = prev.videos.findIndex(v => v.id === videoId);
      const newCurrentIndex = calculateNewCurrentIndex(newVideos, removedIndex, prev.currentIndex);

      return {
        ...prev,
        videos: newVideos,
        currentIndex: newCurrentIndex,
      };
    });
  }, []);

  const playVideo = useCallback(
    (index: number) => {
      const video = simplePlaylist.videos[index];
      if (!video) return;

      setSimplePlaylist(prev => ({ ...prev, currentIndex: index }));

      router.setParams({
        videoId: video.videoId,
        title: video.title,
        author: video.author || '',
        thumbnail: video.thumbnail || '',
        url: video.url,
        isFromApi: 'true',
      });

      setVideoTitle(video.title);
      setVideoAuthor(video.author || '');
      setVideoThumbnail(video.thumbnail || '');
      setTitle(video.title);
      setTopBarVideoState(video.videoId, video.title);
    },
    [simplePlaylist.videos, router, setTitle, setTopBarVideoState]
  );

  const reorderVideos = useCallback(
    (newOrder: QueueVideoItem[]) => {
      const reorderedVideos = reorderVideosByQueueItems(newOrder, simplePlaylist.videos);

      setSimplePlaylist(prev => ({
        ...prev,
        videos: reorderedVideos,
      }));
    },
    [simplePlaylist.videos]
  );

  const handleVideoEnd = useCallback(() => {
    if (simplePlaylist.videos.length === 0) return;

    const currentVideoIndex = simplePlaylist.videos.findIndex(v => v.videoId === videoId);
    if (currentVideoIndex === -1) return;

    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < simplePlaylist.videos.length) {
      setTimeout(() => {
        playVideo(nextIndex);
      }, 500);
    }
  }, [simplePlaylist.videos, videoId, playVideo]);

  const captureMoment = useCallback(async () => {
    if (!videoState.isReady || !videoId || !playerRef.current) {
      return;
    }

    try {
      const currentTime = await playerRef.current.getCurrentTime();
      let timeToCapture = currentTime;
      if (currentTime === undefined || currentTime === null) {
        timeToCapture = videoState.currentTime;
      }

      await captureFromContext(
        videoId,
        timeToCapture,
        settings.momentDuration,
        videoTitle || 'Sans titre',
        url || `https://youtube.com/watch?v=${videoId}`,
        videoThumbnail
      );
    } catch (error) {}
  }, [videoState, videoId, videoTitle, url, videoThumbnail, settings, captureFromContext, playerRef]);

  const playMoment = useCallback(
    (timestamp: number) => {
      if (isSeekingRef.current) return;

      isSeekingRef.current = true;

      if (playerRef.current && videoState.isReady) {
        playerRef.current.seekTo(timestamp, true);
        // Auto-play après avoir positionné la vidéo
        setTimeout(() => {
          playerRef.current?.playVideo();
          isSeekingRef.current = false;
        }, 500);
      } else {
        setSeekToTime(timestamp);
      }
    },
    [videoState, playerRef]
  );

  const deleteMoment = useCallback(
    (momentId: string) => {
      Alert.alert('Supprimer le moment', 'Êtes-vous sûr de vouloir supprimer ce moment?', [
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
              Alert.alert('Erreur', 'Impossible de supprimer le moment');
            }
          },
        },
      ]);
    },
    [videoId, deleteMomentFromVideo]
  );

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  useEffect(() => {
    savePlaylist();
  }, [savePlaylist]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (videoId && videoTitle) {
      setTopBarVideoState(videoId, videoTitle);
    }
  }, [videoId, videoTitle, setTopBarVideoState]);

  useEffect(() => {
    setTitle(videoTitle || 'Lecteur Vidéo');
  }, [videoTitle, setTitle]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoAddToPlaylist();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [autoAddToPlaylist]);

  useEffect(() => {
    updateCurrentIndex();
  }, [updateCurrentIndex]);

  useEffect(() => {
    const cleanup = registerBackNavigation(() => router.back());
    return cleanup;
  }, [registerBackNavigation, router]);

  useEffect(() => {
    return () => clearVideoState();
  }, [clearVideoState]);

  return {
    videoId,
    videoTitle,
    videoAuthor,
    videoThumbnail,
    url,
    videoState,
    seekToTime,
    getVideoHeight,
    moments,
    queueData,
    getCurrentVideoId,
    simplePlaylist,
    isDark,
    handleVideoStateChange,
    handleVideoEnd,
    addVideoByUrl,
    removeVideo,
    playVideo,
    reorderVideos,
    captureMoment,
    playMoment,
    deleteMoment,
  };
}
