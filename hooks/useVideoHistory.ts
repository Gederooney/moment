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
        parsedVideos.map(async (video) => {
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
      console.error('Error loading video history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add or update a video in history
  const addVideoToHistory = useCallback(async (videoData: {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    author?: string;
    thumbnailFromApi?: string;
    metadataLoadedFromApi?: boolean;
  }) => {
    try {
      // Check if video already exists
      const existingVideoIndex = videos.findIndex(v => v.id === videoData.id);

      if (existingVideoIndex >= 0) {
        // Update existing video's addedAt date
        const updatedVideos = [...videos];
        updatedVideos[existingVideoIndex] = {
          ...updatedVideos[existingVideoIndex],
          ...videoData,
          addedAt: new Date(),
        };

        // Move to top
        const [updated] = updatedVideos.splice(existingVideoIndex, 1);
        updatedVideos.unshift(updated);

        setVideos(updatedVideos);

        // Save to storage
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
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

        const updatedVideos = [newVideo, ...videos];
        setVideos(updatedVideos);

        // Save to storage
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
      }
    } catch (error) {
      console.error('Error adding video to history:', error);
    }
  }, [videos]);

  // Add moment to a video
  const addMomentToVideo = useCallback(async (videoId: string, moment: CapturedMoment) => {
    try {
      // Use functional update to properly handle async state update
      await new Promise<void>((resolve) => {
        setVideos((currentVideos) => {
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
              await AsyncStorage.setItem(`${MOMENTS_STORAGE_KEY}_${videoId}`, JSON.stringify(videoMoments));

              // Update video history
              await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
              resolve();
            } catch (error) {
              console.error('Error saving to storage:', error);
              resolve(); // Resolve even on error to not block
            }
          })();

          return updatedVideos;
        });
      });
    } catch (error) {
      console.error('Error adding moment to video:', error);
    }
  }, []);

  // Delete a moment
  const deleteMoment = useCallback(async (momentId: string) => {
    try {
      const updatedVideos = videos.map(video => ({
        ...video,
        moments: video.moments.filter(moment => moment.id !== momentId),
      }));

      setVideos(updatedVideos);

      // Save updated moments for each video
      await Promise.all(
        updatedVideos.map(async (video) => {
          await AsyncStorage.setItem(`${MOMENTS_STORAGE_KEY}_${video.id}`, JSON.stringify(video.moments));
        })
      );

      // Update video history
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
    } catch (error) {
      console.error('Error deleting moment:', error);
    }
  }, [videos]);

  // Delete all moments for a video
  const deleteAllMomentsForVideo = useCallback(async (videoId: string) => {
    try {
      const updatedVideos = videos.map(video => {
        if (video.id === videoId) {
          return { ...video, moments: [] };
        }
        return video;
      });

      setVideos(updatedVideos);

      // Clear moments storage for this video
      await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);

      // Update video history
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
    } catch (error) {
      console.error('Error deleting all moments for video:', error);
    }
  }, [videos]);

  // Delete a video and all its moments
  const deleteVideo = useCallback(async (videoId: string) => {
    try {
      const updatedVideos = videos.filter(video => video.id !== videoId);
      setVideos(updatedVideos);

      // Remove from storage
      await AsyncStorage.removeItem(`${MOMENTS_STORAGE_KEY}_${videoId}`);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedVideos));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }, [videos]);

  // Search videos by title
  const searchVideos = useCallback((query: string): VideoWithMoments[] => {
    if (!query.trim()) return videos;

    return videos.filter(video =>
      video.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [videos]);

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
      console.error('Error clearing history:', error);
    }
  }, []);

  // Get video by ID
  const getVideoById = useCallback((videoId: string): VideoWithMoments | undefined => {
    return videos.find(video => video.id === videoId);
  }, [videos]);

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