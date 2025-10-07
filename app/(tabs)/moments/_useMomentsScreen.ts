import { useState, useCallback, useEffect } from 'react';
import { Alert, Keyboard, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useMomentsContext } from '../../../contexts/MomentsContext';
import { useTopBarContext } from '../../../contexts/TopBarContext';
import { fetchYouTubeMetadataWithFallback } from '../../../services/youtubeMetadata';
import { extractVideoId, isValidYouTubeUrl, normalizeYouTubeUrl } from '../../../utils/youtube';
import { TagService } from '../../../services/tagService';
import { VideoWithMoments } from '../../../types/moment';

interface ProcessedVideoResult {
  videoId: string;
  normalizedUrl: string;
  metadata: {
    title: string;
    author_name: string;
    thumbnail_url: string;
    isFromApi: boolean;
  };
}

function buildPlayerParams(videoId: string, params: any) {
  return {
    pathname: '/player' as const,
    params,
  };
}

function extractPlayerParams(video: any, videoId: string, timestamp: number) {
  return {
    videoId,
    timestamp: timestamp.toString(),
    title: video?.title || 'Vidéo YouTube',
    author: video?.author || '',
    thumbnail: video?.thumbnailFromApi || video?.thumbnail || '',
    url: video?.url || `https://youtube.com/watch?v=${videoId}`,
    isFromApi: (video?.metadataLoadedFromApi || false).toString(),
  };
}

function buildMetadataParams(result: ProcessedVideoResult) {
  return {
    videoId: result.videoId,
    title: result.metadata.title,
    author: result.metadata.author_name,
    thumbnail: result.metadata.thumbnail_url,
    url: result.normalizedUrl,
    isFromApi: result.metadata.isFromApi.toString(),
  };
}

export function useMomentsScreen() {
  const router = useRouter();
  const {
    videos,
    isLoading,
    refreshMoments,
    deleteMoment,
    deleteAllMomentsForVideo,
    clearAllHistory,
    searchVideos,
    getTotalMomentsCount,
    subscribeMomentUpdates,
  } = useMomentsContext();

  const { setTitle, clearVideoState } = useTopBarContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // First filter by search query
  const searchFilteredVideos = searchVideos(searchQuery);

  // Then filter by tags if any are selected
  const filteredVideos = selectedTags.length > 0
    ? filterVideosByTags(searchFilteredVideos, selectedTags)
    : searchFilteredVideos;

  // Helper function to filter videos by tags (AND logic)
  function filterVideosByTags(videos: VideoWithMoments[], tags: string[]): VideoWithMoments[] {
    if (tags.length === 0) return videos;

    const normalizedTags = tags.map(t => t.toLowerCase().trim());

    return videos
      .map(video => {
        // Filter moments that have all selected tags
        const filteredMoments = video.moments.filter(moment => {
          if (!moment.tags || moment.tags.length === 0) return false;
          const momentTagsNormalized = moment.tags.map(t => t.toLowerCase().trim());
          return normalizedTags.every(tag => momentTagsNormalized.includes(tag));
        });

        // Only include video if it has matching moments
        if (filteredMoments.length === 0) return null;

        return {
          ...video,
          moments: filteredMoments,
        };
      })
      .filter((video): video is VideoWithMoments => video !== null);
  }

  useEffect(() => {
    setIsUrlValid(isValidYouTubeUrl(videoUrl));
  }, [videoUrl]);

  useEffect(() => {
    const unsubscribe = subscribeMomentUpdates(() => {});
    return unsubscribe;
  }, [subscribeMomentUpdates]);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      const tags = await TagService.getAllTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, [videos]); // Reload when videos change

  useFocusEffect(
    useCallback(() => {
      clearVideoState();
      setTitle('Moments');
    }, [setTitle, clearVideoState])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMoments();
    setRefreshing(false);
  }, [refreshMoments]);

  const handleToggleExpand = useCallback(
    (videoId: string) => {
      setExpandedVideoId(current =>
        current === videoId ? null : videoId
      );
    },
    []
  );

  const navigateToPlayer = useCallback(
    (videoId: string, params: any) => {
      router.push(buildPlayerParams(videoId, params));
    },
    [router]
  );

  const handlePlayMoment = useCallback(
    (videoId: string, timestamp: number) => {
      const video = videos.find(v => v.id === videoId);
      const params = extractPlayerParams(video, videoId, timestamp);
      navigateToPlayer(videoId, params);
    },
    [videos, navigateToPlayer]
  );

  const handleDeleteMoment = useCallback(
    async (momentId: string) => {
      await deleteMoment(momentId);
    },
    [deleteMoment]
  );

  const handleDeleteAllMomentsForVideo = useCallback(
    async (videoId: string) => {
      await deleteAllMomentsForVideo(videoId);
    },
    [deleteAllMomentsForVideo]
  );

  const handleClearAllHistory = useCallback(() => {
    Alert.alert(
      'Effacer tous les moments',
      'Êtes-vous sûr de vouloir supprimer tous les moments ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: clearAllHistory,
        },
      ]
    );
  }, [clearAllHistory]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const normalizedTag = tag.toLowerCase().trim();
      const isSelected = prev.some(t => t.toLowerCase().trim() === normalizedTag);

      if (isSelected) {
        return prev.filter(t => t.toLowerCase().trim() !== normalizedTag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  const handleClearTagFilters = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const getFilteredMomentsCount = useCallback(() => {
    return filteredVideos.reduce((count, video) => count + video.moments.length, 0);
  }, [filteredVideos]);

  const showAddVideoModal = useCallback(() => {
    setIsModalVisible(true);
    modalAnimation.setValue(0);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalAnimation]);

  const hideAddVideoModal = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setVideoUrl('');
      setIsLoadingMetadata(false);
    });
  }, [modalAnimation]);

  const processVideoUrl = useCallback(
    async (url: string): Promise<ProcessedVideoResult | null> => {
      const normalizedUrl = normalizeYouTubeUrl(url);
      const videoId = extractVideoId(normalizedUrl);

      if (!videoId) {
        Alert.alert('Erreur',
          "Impossible d'extraire l'ID de la vidéo."
        );
        return null;
      }

      const metadata = await fetchYouTubeMetadataWithFallback(
        normalizedUrl,
        videoId
      );

      return { videoId, normalizedUrl, metadata };
    },
    []
  );

  const navigateAfterProcessing = useCallback(
    (result: ProcessedVideoResult) => {
      const params = buildMetadataParams(result);
      navigateToPlayer(result.videoId, params);
    },
    [navigateToPlayer]
  );

  const handleAddVideo = useCallback(async () => {
    if (!isUrlValid || isLoadingMetadata) return;

    try {
      setIsLoadingMetadata(true);
      const result = await processVideoUrl(videoUrl);

      if (!result) return;

      hideAddVideoModal();
      navigateAfterProcessing(result);
    } catch (error) {
      Alert.alert(
        'Erreur',
        "Impossible de charger les informations de la vidéo. Vérifiez l'URL et votre connexion internet."
      );
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [isUrlValid, isLoadingMetadata, videoUrl,
    processVideoUrl, hideAddVideoModal, navigateAfterProcessing]);

  return {
    videos,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedVideoId,
    refreshing,
    filteredVideos,
    isModalVisible,
    videoUrl,
    setVideoUrl,
    isUrlValid,
    isLoadingMetadata,
    modalAnimation,
    getTotalMomentsCount,
    handleRefresh,
    handleToggleExpand,
    handlePlayMoment,
    handleDeleteMoment,
    handleDeleteAllMomentsForVideo,
    handleClearAllHistory,
    showAddVideoModal,
    hideAddVideoModal,
    handleAddVideo,
    selectedTags,
    availableTags,
    handleToggleTag,
    handleClearTagFilters,
    getFilteredMomentsCount,
  };
}
