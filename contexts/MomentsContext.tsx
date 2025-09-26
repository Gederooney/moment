import React, { createContext, useContext, useRef, useCallback } from 'react';
import { VideoWithMoments, CapturedMoment } from '../types/moment';
import { useVideoHistory } from '../hooks/useVideoHistory';
import { formatTime } from '../utils/time';
import { StorageService } from '../services/storageService';
import { getVideoThumbnail } from '../utils/youtube';

interface MomentsContextType {
  videos: VideoWithMoments[];
  isLoading: boolean;
  refreshMoments: () => Promise<void>;
  addMomentToVideo: (videoId: string, moment: CapturedMoment) => Promise<void>;
  deleteMoment: (momentId: string) => Promise<void>;
  deleteAllMomentsForVideo: (videoId: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
  searchVideos: (query: string) => VideoWithMoments[];
  getTotalMomentsCount: () => number;
  getVideoById: (videoId: string) => VideoWithMoments | undefined;
  // Real-time sync functions
  notifyMomentAdded: (videoId: string, moment: CapturedMoment) => void;
  subscribeMomentUpdates: (callback: (videos: VideoWithMoments[]) => void) => () => void;
  // New unified capture methods
  captureMoment: (
    videoId: string,
    timestamp: number,
    duration?: number,
    videoTitle?: string,
    videoUrl?: string,
    thumbnailUrl?: string
  ) => Promise<CapturedMoment>;
  getMomentsForVideo: (videoId: string) => CapturedMoment[];
  deleteMomentFromVideo: (videoId: string, momentId: string) => Promise<void>;
}

const MomentsContext = createContext<MomentsContextType | undefined>(undefined);

interface MomentsProviderProps {
  children: React.ReactNode;
}

export function MomentsProvider({ children }: MomentsProviderProps) {
  const videoHistory = useVideoHistory();
  const updateSubscribersRef = useRef<Set<(videos: VideoWithMoments[]) => void>>(new Set());
  const videoHistoryRef = useRef(videoHistory);

  // Update ref when videoHistory changes
  videoHistoryRef.current = videoHistory;

  // Function to notify all subscribers about moments updates
  const notifySubscribers = useCallback((videos: VideoWithMoments[]) => {
    updateSubscribersRef.current.forEach(callback => callback(videos));
  }, []);

  // Enhanced addMomentToVideo with real-time sync
  const addMomentToVideo = useCallback(
    async (videoId: string, moment: CapturedMoment) => {
      await videoHistory.addMomentToVideo(videoId, moment);
      // Notify all subscribers immediately
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.addMomentToVideo, notifySubscribers]
  );

  // Enhanced deleteMoment with real-time sync
  const deleteMoment = useCallback(
    async (momentId: string) => {
      await videoHistory.deleteMoment(momentId);
      // Notify all subscribers immediately
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.deleteMoment, notifySubscribers]
  );

  // Enhanced deleteAllMomentsForVideo with real-time sync
  const deleteAllMomentsForVideo = useCallback(
    async (videoId: string) => {
      await videoHistory.deleteAllMomentsForVideo(videoId);
      // Notify all subscribers immediately
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.deleteAllMomentsForVideo, notifySubscribers]
  );

  // Enhanced clearAllHistory with real-time sync
  const clearAllHistory = useCallback(async () => {
    await videoHistory.clearAllHistory();
    // Notify all subscribers immediately
    notifySubscribers(videoHistory.videos);
  }, [videoHistory.clearAllHistory, notifySubscribers]);

  // Function for components to subscribe to real-time updates
  const subscribeMomentUpdates = useCallback((callback: (videos: VideoWithMoments[]) => void) => {
    updateSubscribersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      updateSubscribersRef.current.delete(callback);
    };
  }, []);

  // Function to manually trigger moment addition notification (for external use)
  const notifyMomentAdded = useCallback(
    (videoId: string, moment: CapturedMoment) => {
      // This is called after the moment is added to trigger real-time updates
      notifySubscribers(videoHistoryRef.current.videos);
    },
    [notifySubscribers]
  );

  // NEW UNIFIED CAPTURE METHOD - Directly captures moments from the player
  const captureMoment = useCallback(
    async (
      videoId: string,
      timestamp: number,
      duration: number = 30,
      videoTitle?: string,
      videoUrl?: string,
      thumbnailUrl?: string
    ): Promise<CapturedMoment> => {
      // Use the duration passed as parameter (which comes from settings)
      const momentDuration = duration;

      const newMoment: CapturedMoment = {
        id: `${videoId}_${timestamp}_${Date.now()}`,
        videoId,
        timestamp,
        duration: momentDuration,
        title: `Moment à ${formatTime(timestamp)}`,
        createdAt: new Date(),
      };

      // Ensure video exists in history before adding moment
      const existingVideo = videoHistory.getVideoById(videoId);
      if (!existingVideo && videoTitle) {
        // Create video in history if it doesn't exist with enriched metadata
        await videoHistory.addVideoToHistory({
          id: videoId,
          title: videoTitle,
          thumbnail: thumbnailUrl || getVideoThumbnail(videoId),
          url: videoUrl || `https://youtube.com/watch?v=${videoId}`,
          thumbnailFromApi: thumbnailUrl,
          metadataLoadedFromApi: !!thumbnailUrl,
        });

        // Add a small delay to allow state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Add moment to video with real-time sync
      await addMomentToVideo(videoId, newMoment);

      return newMoment;
    },
    [videoHistory, addMomentToVideo]
  );

  // NEW GET MOMENTS FOR VIDEO METHOD
  const getMomentsForVideo = useCallback(
    (videoId: string): CapturedMoment[] => {
      const video = videoHistory.getVideoById(videoId);
      return video?.moments || [];
    },
    [videoHistory]
  );

  // NEW DELETE MOMENT FROM VIDEO METHOD
  const deleteMomentFromVideo = useCallback(
    async (videoId: string, momentId: string) => {
      await deleteMoment(momentId);
    },
    [deleteMoment]
  );

  const contextValue: MomentsContextType = {
    videos: videoHistory.videos,
    isLoading: videoHistory.isLoading,
    refreshMoments: videoHistory.loadHistory,
    addMomentToVideo,
    deleteMoment,
    deleteAllMomentsForVideo,
    clearAllHistory,
    searchVideos: videoHistory.searchVideos,
    getTotalMomentsCount: videoHistory.getTotalMomentsCount,
    getVideoById: videoHistory.getVideoById,
    notifyMomentAdded,
    subscribeMomentUpdates,
    // New unified methods
    captureMoment,
    getMomentsForVideo,
    deleteMomentFromVideo,
  };

  return <MomentsContext.Provider value={contextValue}>{children}</MomentsContext.Provider>;
}

export function useMomentsContext() {
  const context = useContext(MomentsContext);
  if (context === undefined) {
    throw new Error('useMomentsContext must be used within a MomentsProvider');
  }
  return context;
}
