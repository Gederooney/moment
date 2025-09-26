import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoWithMoments, CapturedMoment } from '../types/moment';

const HISTORY_STORAGE_KEY = '@podcut_video_history';
const MOMENTS_STORAGE_KEY = '@podcut_moments';

export const useVideoHistory = () => {
  const [videos, setVideos] = useState<VideoWithMoments[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load video history and moments from storage
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load videos
      const videosData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const parsedVideos: VideoWithMoments[] = videosData ? JSON.parse(videosData) : [];

      // Load moments for each video
      const videosWithMoments = await Promise.all(
        parsedVideos.map(async video => {
          const momentsData = await AsyncStorage.getItem(`${MOMENTS_STORAGE_KEY}_${video.id}`);
          const moments: CapturedMoment[] = momentsData ? JSON.parse(momentsData) : [];

          // Convert date strings back to Date objects
          return {
            ...video,
            addedAt: new Date(video.addedAt),
            moments: moments.map(moment => ({
              ...moment,
              createdAt: new Date(moment.createdAt),
            })),
          };
        })
      );

      // Sort by addedAt date (most recent first)
      videosWithMoments.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

      setVideos(videosWithMoments);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add or update a video in history
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
        // Load current data from AsyncStorage to avoid synchronization issues
        const videosData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        const currentVideos: VideoWithMoments[] = videosData ? JSON.parse(videosData) : [];

        // Convert date strings back to Date objects for existing videos
        const parsedCurrentVideos = currentVideos.map(video => ({
          ...video,
          addedAt: new Date(video.addedAt),
          moments:
            video.moments?.map(moment => ({
              ...moment,
              createdAt: new Date(moment.createdAt),
            })) || [],
        }));

        // Check if video already exists in the fresh data from storage
        const existingVideoIndex = parsedCurrentVideos.findIndex(v => v.id === videoData.id);

        let updatedVideos: VideoWithMoments[];

        if (existingVideoIndex >= 0) {
          // Update existing video's addedAt date and metadata
          updatedVideos = [...parsedCurrentVideos];
          updatedVideos[existingVideoIndex] = {
            ...updatedVideos[existingVideoIndex],
            ...videoData,
            addedAt: new Date(),
            // Preserve existing moments
            moments: updatedVideos[existingVideoIndex].moments,
          };

          // Move to top
          const [updated] = updatedVideos.splice(existingVideoIndex, 1);
          updatedVideos.unshift(updated);
        } else {
          // Add new video with enriched metadata
          const newVideo: VideoWithMoments = {
            ...videoData,
            addedAt: new Date(),
            moments: [],
            author: videoData.author,
            thumbnailFromApi: videoData.thumbnailFromApi,
            metadataLoadedFromApi: videoData.metadataLoadedFromApi || false,
          };

          updatedVideos = [newVideo, ...parsedCurrentVideos];
        }

        // Save to storage first
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));

        // Then update React state
        setVideos(updatedVideos);
      } catch (error) {
      }
    },
    []
  );

  // Add moment to a video
  const addMomentToVideo = useCallback(async (videoId: string, moment: CapturedMoment) => {
    try {
      // Use functional update to properly handle async state update
      await new Promise<void>(resolve => {
        setVideos(currentVideos => {
          const updatedVideos = currentVideos.map(video => {
            if (video.id === videoId) {
              const updatedMoments = [moment, ...video.moments];
              return { ...video, moments: updatedMoments };
            }
            return video;
          });

          // Save to storage inside the setter to have access to updated data
          (async () => {
            try {
              // Save moments to storage
              const videoMoments = updatedVideos.find(v => v.id === videoId)?.moments || [];
              await AsyncStorage.setItem(
                `${MOMENTS_STORAGE_KEY}_${videoId}`,
                JSON.stringify(videoMoments)
              );

              // Update video history
              await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
              resolve();
            } catch (error) {
              resolve(); // Resolve even on error to not block
            }
          })();

          return updatedVideos;
        });
      });
    } catch (error) {
    }
  }, []);

  // Delete a moment
  const deleteMoment = useCallback(
    async (momentId: string) => {
      try {
        // Map videos and filter moments, then remove videos with no moments
        const updatedVideos = videos
          .map(video => ({
            ...video,
            moments: video.moments.filter(moment => moment.id !== momentId),
          }))
          // Remove videos that have no moments left
          .filter(video => video.moments.length > 0);

        setVideos(updatedVideos);

        // Save updated moments for each remaining video
        await Promise.all(
          updatedVideos.map(async video => {
            await AsyncStorage.setItem(
              `${MOMENTS_STORAGE_KEY}_${video.id}`,
              JSON.stringify(video.moments)
            );
          })
        );

        // Clean up storage for removed videos (those with no moments)
        const removedVideos = videos.filter(
          v => v.moments.filter(m => m.id !== momentId).length === 0
        );
        await Promise.all(
          removedVideos.map(async video => {
            await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${video.id}`);
          })
        );

        // Update video history
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
      }
    },
    [videos]
  );

  // Delete all moments for a video (removes the video entirely)
  const deleteAllMomentsForVideo = useCallback(
    async (videoId: string) => {
      try {
        // Remove the video entirely since it will have no moments
        const updatedVideos = videos.filter(video => video.id !== videoId);

        setVideos(updatedVideos);

        // Clear moments storage for this video
        await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);

        // Update video history
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
      }
    },
    [videos]
  );

  // Delete a video and all its moments
  const deleteVideo = useCallback(
    async (videoId: string) => {
      try {
        const updatedVideos = videos.filter(video => video.id !== videoId);
        setVideos(updatedVideos);

        // Remove from storage
        await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      } catch (error) {
      }
    },
    [videos]
  );

  // Search videos by title
  const searchVideos = useCallback(
    (query: string): VideoWithMoments[] => {
      if (!query.trim()) return videos;

      return videos.filter(video => video.title.toLowerCase().includes(query.toLowerCase()));
    },
    [videos]
  );

  // Clear all history
  const clearAllHistory = useCallback(async () => {
    try {
      setVideos([]);

      // Clear all storage
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);

      // Clear moments for all videos
      const keys = await AsyncStorage.getAllKeys();
      const momentKeys = keys.filter(key => key.startsWith(MOMENTS_STORAGE_KEY));
      await AsyncStorage.multiRemove(momentKeys);
    } catch (error) {
    }
  }, []);

  // Get video by ID
  const getVideoById = useCallback(
    (videoId: string): VideoWithMoments | undefined => {
      return videos.find(video => video.id === videoId);
    },
    [videos]
  );

  // Get total moments count
  const getTotalMomentsCount = useCallback((): number => {
    return videos.reduce((total, video) => total + video.moments.length, 0);
  }, [videos]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    videos,
    isLoading,
    loadHistory,
    addVideoToHistory,
    addMomentToVideo,
    deleteMoment,
    deleteAllMomentsForVideo,
    deleteVideo,
    searchVideos,
    clearAllHistory,
    getVideoById,
    getTotalMomentsCount,
  };
};
