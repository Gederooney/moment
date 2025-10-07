import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoWithMoments, CapturedMoment } from '../types/moment';
import { Logger } from '../services/logger/Logger';

const HISTORY_STORAGE_KEY = '@podcut_video_history';
const MOMENTS_STORAGE_KEY = '@podcut_moments';

async function loadVideoMoments(videoId: string): Promise<CapturedMoment[]> {
  const momentsData = await AsyncStorage.getItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);
  const moments: CapturedMoment[] = momentsData ? JSON.parse(momentsData) : [];
  return moments.map(moment => ({
    ...moment,
    createdAt: new Date(moment.createdAt),
  }));
}

async function hydrateVideoWithMoments(video: VideoWithMoments): Promise<VideoWithMoments> {
  const moments = await loadVideoMoments(video.id);
  return {
    ...video,
    addedAt: new Date(video.addedAt),
    moments,
  };
}

async function loadCurrentVideosFromStorage(): Promise<VideoWithMoments[]> {
  const videosData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  const currentVideos: VideoWithMoments[] = videosData ? JSON.parse(videosData) : [];

  return currentVideos.map(video => ({
    ...video,
    addedAt: new Date(video.addedAt),
    moments: video.moments?.map(moment => ({
      ...moment,
      createdAt: new Date(moment.createdAt),
    })) || [],
  }));
}

function updateExistingVideo(
  videos: VideoWithMoments[],
  index: number,
  videoData: any
): VideoWithMoments[] {
  const updatedVideos = [...videos];
  updatedVideos[index] = {
    ...updatedVideos[index],
    ...videoData,
    addedAt: new Date(),
    moments: updatedVideos[index].moments,
  };

  const [updated] = updatedVideos.splice(index, 1);
  updatedVideos.unshift(updated);
  return updatedVideos;
}

function createNewVideoEntry(
  videos: VideoWithMoments[],
  videoData: any
): VideoWithMoments[] {
  const newVideo: VideoWithMoments = {
    ...videoData,
    addedAt: new Date(),
    moments: [],
    metadataLoadedFromApi: videoData.metadataLoadedFromApi || false,
  };
  return [newVideo, ...videos];
}

function updateVideosWithMoment(
  currentVideos: VideoWithMoments[],
  videoId: string,
  moment: CapturedMoment
): VideoWithMoments[] {
  return currentVideos.map(video => {
    if (video.id === videoId) {
      return { ...video, moments: [moment, ...video.moments] };
    }
    return video;
  });
}

async function saveMomentToStorage(
  updatedVideos: VideoWithMoments[],
  videoId: string
): Promise<void> {
  const videoMoments = updatedVideos.find(v => v.id === videoId)?.moments || [];
  await AsyncStorage.setItem(`${MOMENTS_STORAGE_KEY}_${videoId}`, JSON.stringify(videoMoments));
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
}

function filterVideosRemovingMoment(
  videos: VideoWithMoments[],
  momentId: string
): VideoWithMoments[] {
  return videos
    .map(video => ({
      ...video,
      moments: video.moments.filter(moment => moment.id !== momentId),
    }))
    .filter(video => video.moments.length > 0);
}

async function saveUpdatedMomentsToStorage(updatedVideos: VideoWithMoments[]): Promise<void> {
  await Promise.all(
    updatedVideos.map(async video => {
      await AsyncStorage.setItem(
        `${MOMENTS_STORAGE_KEY}_${video.id}`,
        JSON.stringify(video.moments)
      );
    })
  );
}

async function cleanupRemovedVideosStorage(
  videos: VideoWithMoments[],
  momentId: string
): Promise<void> {
  const removedVideos = videos.filter(
    v => v.moments.filter(m => m.id !== momentId).length === 0
  );
  await Promise.all(
    removedVideos.map(async video => {
      await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${video.id}`);
    })
  );
}

export const useVideoHistory = () => {
  const [videos, setVideos] = useState<VideoWithMoments[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const videosData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const parsedVideos: VideoWithMoments[] = videosData ? JSON.parse(videosData) : [];

      const videosWithMoments = await Promise.all(
        parsedVideos.map(hydrateVideoWithMoments)
      );

      videosWithMoments.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
      setVideos(videosWithMoments);
    } catch (error) {
      Logger.error('useVideoHistory.loadHistory', error instanceof Error ? error : 'Failed to load history');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addVideoToHistory = useCallback(
    async (videoData: {
      id: string;
      title: string;
      thumbnail: string;
      url: string;
      author?: string;
      thumbnailFromApi?: string;
      metadataLoadedFromApi?: boolean;
    }) => {
      try {
        const currentVideos = await loadCurrentVideosFromStorage();
        const existingVideoIndex = currentVideos.findIndex(v => v.id === videoData.id);

        const updatedVideos = existingVideoIndex >= 0
          ? updateExistingVideo(currentVideos, existingVideoIndex, videoData)
          : createNewVideoEntry(currentVideos, videoData);

        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
        setVideos(updatedVideos);
      } catch (error) {
        Logger.error('useVideoHistory.addVideoToHistory', error instanceof Error ? error : 'Failed to add video to history', { videoId: videoData.id });
        throw error;
      }
    },
    []
  );

  const addMomentToVideo = useCallback(async (videoId: string, moment: CapturedMoment) => {
    try {
      let updatedVideos: VideoWithMoments[] = [];
      setVideos(currentVideos => {
        updatedVideos = updateVideosWithMoment(currentVideos, videoId, moment);
        return updatedVideos;
      });

      await saveMomentToStorage(updatedVideos, videoId);
    } catch (error) {
      Logger.error('useVideoHistory.addMomentToVideo', error instanceof Error ? error : 'Failed to add moment', { videoId, momentId: moment.id });
      throw error;
    }
  }, []);

  const updateMoment = useCallback(
    async (momentId: string, updates: Partial<CapturedMoment>) => {
      try {
        const updatedVideos = videos.map(video => ({
          ...video,
          moments: video.moments.map(moment =>
            moment.id === momentId ? { ...moment, ...updates } : moment
          ),
        }));

        setVideos(updatedVideos);

        await Promise.all(
          updatedVideos.map(async video => {
            await AsyncStorage.setItem(
              `${MOMENTS_STORAGE_KEY}_${video.id}`,
              JSON.stringify(video.moments)
            );
          })
        );
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
        Logger.error('useVideoHistory.updateMoment', error instanceof Error ? error : 'Failed to update moment', { momentId });
        throw error;
      }
    },
    [videos]
  );

  const deleteMoment = useCallback(
    async (momentId: string) => {
      try {
        const updatedVideos = filterVideosRemovingMoment(videos, momentId);
        setVideos(updatedVideos);
        await saveUpdatedMomentsToStorage(updatedVideos);
        await cleanupRemovedVideosStorage(videos, momentId);
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
        Logger.error('useVideoHistory.deleteMoment', error instanceof Error ? error : 'Failed to delete moment', { momentId });
        throw error;
      }
    },
    [videos]
  );

  const deleteAllMomentsForVideo = useCallback(
    async (videoId: string) => {
      try {
        const updatedVideos = videos.filter(video => video.id !== videoId);

        setVideos(updatedVideos);
        await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
        Logger.error('useVideoHistory.deleteAllMomentsForVideo', error instanceof Error ? error : 'Failed to delete all moments', { videoId });
        throw error;
      }
    },
    [videos]
  );

  const deleteVideo = useCallback(
    async (videoId: string) => {
      try {
        const updatedVideos = videos.filter(video => video.id !== videoId);
        setVideos(updatedVideos);

        await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
        Logger.error('useVideoHistory.deleteVideo', error instanceof Error ? error : 'Failed to delete video', { videoId });
        throw error;
      }
    },
    [videos]
  );

  const searchVideos = useCallback(
    (query: string): VideoWithMoments[] => {
      if (!query.trim()) return videos;

      const lowerQuery = query.toLowerCase();

      return videos
        .map(video => {
          // Check video title match
          const matchesVideoTitle = video.title.toLowerCase().includes(lowerQuery);

          // Filter moments that match the search query
          const matchingMoments = video.moments.filter(moment => {
            // Search in moment title
            const matchesMomentTitle = moment.title.toLowerCase().includes(lowerQuery);

            // Search in notes content
            const matchesNotes = moment.notes?.toLowerCase().includes(lowerQuery) || false;

            // Search in tags
            const matchesTags = moment.tags?.some(tag =>
              tag.toLowerCase().includes(lowerQuery)
            ) || false;

            return matchesMomentTitle || matchesNotes || matchesTags;
          });

          // If video title matches, return all moments
          if (matchesVideoTitle) {
            return video;
          }

          // If some moments match, return video with filtered moments
          if (matchingMoments.length > 0) {
            return {
              ...video,
              moments: matchingMoments,
            };
          }

          return null;
        })
        .filter((video): video is VideoWithMoments => video !== null);
    },
    [videos]
  );

  const clearAllHistory = useCallback(async () => {
    try {
      setVideos([]);
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);

      const keys = await AsyncStorage.getAllKeys();
      const momentKeys = keys.filter(key => key.startsWith(MOMENTS_STORAGE_KEY));
      await AsyncStorage.multiRemove(momentKeys);
    } catch (error) {
      Logger.error('useVideoHistory.clearAllHistory', error instanceof Error ? error : 'Failed to clear all history');
      throw error;
    }
  }, []);

  const getVideoById = useCallback(
    (videoId: string): VideoWithMoments | undefined => {
      return videos.find(video => video.id === videoId);
    },
    [videos]
  );

  const getTotalMomentsCount = useCallback((): number => {
    return videos.reduce((total, video) => total + video.moments.length, 0);
  }, [videos]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    videos,
    isLoading,
    loadHistory,
    addVideoToHistory,
    addMomentToVideo,
    updateMoment,
    deleteMoment,
    deleteAllMomentsForVideo,
    deleteVideo,
    searchVideos,
    clearAllHistory,
    getVideoById,
    getTotalMomentsCount,
  };
};
