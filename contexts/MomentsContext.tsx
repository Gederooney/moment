import React, { createContext, useContext, useRef, useCallback } from 'react';
import { VideoWithMoments, CapturedMoment } from '../types/moment';
import { useVideoHistory } from '../hooks/useVideoHistory';
import { formatTime } from '../utils/time';
import { getVideoThumbnail } from '../utils/youtube';

interface MomentsContextType {
  videos: VideoWithMoments[];
  isLoading: boolean;
  refreshMoments: () => Promise<void>;
  addMomentToVideo: (videoId: string, moment: CapturedMoment) => Promise<void>;
  updateMoment: (momentId: string, updates: Partial<CapturedMoment>) => Promise<void>;
  updateMomentNotes: (momentId: string, notes: string) => Promise<void>;
  updateMomentTags: (momentId: string, tags: string[]) => Promise<void>;
  deleteMoment: (momentId: string) => Promise<void>;
  deleteAllMomentsForVideo: (videoId: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
  searchVideos: (query: string) => VideoWithMoments[];
  getTotalMomentsCount: () => number;
  getVideoById: (videoId: string) => VideoWithMoments | undefined;
  notifyMomentAdded: (videoId: string, moment: CapturedMoment) => void;
  subscribeMomentUpdates: (callback: (videos: VideoWithMoments[]) => void) => () => void;
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
  getAllMoments: () => CapturedMoment[];
}

const MomentsContext = createContext<MomentsContextType | undefined>(undefined);

interface MomentsProviderProps {
  children: React.ReactNode;
}

export function MomentsProvider({ children }: MomentsProviderProps) {
  const videoHistory = useVideoHistory();
  const updateSubscribersRef = useRef<Set<(videos: VideoWithMoments[]) => void>>(new Set());
  const videoHistoryRef = useRef(videoHistory);

  videoHistoryRef.current = videoHistory;

  React.useEffect(() => {
    return () => {
      updateSubscribersRef.current.clear();
    };
  }, []);

  const notifySubscribers = useCallback((videos: VideoWithMoments[]) => {
    updateSubscribersRef.current.forEach(callback => callback(videos));
  }, []);

  const addMomentToVideo = useCallback(
    async (videoId: string, moment: CapturedMoment) => {
      await videoHistory.addMomentToVideo(videoId, moment);
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.addMomentToVideo, notifySubscribers]
  );

  const updateMoment = useCallback(
    async (momentId: string, updates: Partial<CapturedMoment>) => {
      await videoHistory.updateMoment(momentId, updates);
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.updateMoment, notifySubscribers]
  );

  const deleteMoment = useCallback(
    async (momentId: string) => {
      await videoHistory.deleteMoment(momentId);
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.deleteMoment, notifySubscribers]
  );

  const deleteAllMomentsForVideo = useCallback(
    async (videoId: string) => {
      await videoHistory.deleteAllMomentsForVideo(videoId);
      notifySubscribers(videoHistory.videos);
    },
    [videoHistory.deleteAllMomentsForVideo, notifySubscribers]
  );

  const clearAllHistory = useCallback(async () => {
    await videoHistory.clearAllHistory();
    notifySubscribers(videoHistory.videos);
  }, [videoHistory.clearAllHistory, notifySubscribers]);

  const subscribeMomentUpdates = useCallback((callback: (videos: VideoWithMoments[]) => void) => {
    updateSubscribersRef.current.add(callback);
    return () => {
      updateSubscribersRef.current.delete(callback);
    };
  }, []);

  const notifyMomentAdded = useCallback(
    (videoId: string, moment: CapturedMoment) => {
      notifySubscribers(videoHistoryRef.current.videos);
    },
    [notifySubscribers]
  );

  const createMomentObject = (
    videoId: string,
    timestamp: number,
    duration: number
  ): CapturedMoment => ({
    id: `${videoId}_${timestamp}_${Date.now()}`,
    videoId,
    timestamp,
    duration,
    title: `Moment à ${formatTime(timestamp)}`,
    createdAt: new Date(),
  });

  const ensureVideoExists = async (
    videoId: string,
    videoTitle?: string,
    videoUrl?: string,
    thumbnailUrl?: string
  ): Promise<void> => {
    const existingVideo = videoHistory.getVideoById(videoId);
    if (existingVideo || !videoTitle) return;

    await videoHistory.addVideoToHistory({
      id: videoId,
      title: videoTitle,
      thumbnail: thumbnailUrl || getVideoThumbnail(videoId),
      url: videoUrl || `https://youtube.com/watch?v=${videoId}`,
      thumbnailFromApi: thumbnailUrl,
      metadataLoadedFromApi: !!thumbnailUrl,
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const captureMoment = useCallback(
    async (
      videoId: string,
      timestamp: number,
      duration: number = 30,
      videoTitle?: string,
      videoUrl?: string,
      thumbnailUrl?: string
    ): Promise<CapturedMoment> => {
      await ensureVideoExists(videoId, videoTitle, videoUrl, thumbnailUrl);
      const existingMoments = getMomentsForVideo(videoId);
      const momentNumber = existingMoments.length + 1;
      const newMoment = {
        ...createMomentObject(videoId, timestamp, duration),
        title: `Moment ${momentNumber}`,
      };
      await addMomentToVideo(videoId, newMoment);
      return newMoment;
    },
    [videoHistory, addMomentToVideo]
  );

  const getMomentsForVideo = useCallback(
    (videoId: string): CapturedMoment[] => {
      const video = videoHistory.getVideoById(videoId);
      return video?.moments || [];
    },
    [videoHistory]
  );

  const deleteMomentFromVideo = useCallback(
    async (videoId: string, momentId: string) => {
      await deleteMoment(momentId);
    },
    [deleteMoment]
  );

  const updateMomentNotes = useCallback(
    async (momentId: string, notes: string) => {
      await updateMoment(momentId, { notes });
    },
    [updateMoment]
  );

  const updateMomentTags = useCallback(
    async (momentId: string, tags: string[]) => {
      await updateMoment(momentId, { tags });
    },
    [updateMoment]
  );

  const getAllMoments = useCallback((): CapturedMoment[] => {
    return videoHistory.videos.flatMap(video => video.moments);
  }, [videoHistory.videos]);

  const contextValue: MomentsContextType = {
    videos: videoHistory.videos,
    isLoading: videoHistory.isLoading,
    refreshMoments: videoHistory.loadHistory,
    addMomentToVideo,
    updateMoment,
    updateMomentNotes,
    updateMomentTags,
    deleteMoment,
    deleteAllMomentsForVideo,
    clearAllHistory,
    searchVideos: videoHistory.searchVideos,
    getTotalMomentsCount: videoHistory.getTotalMomentsCount,
    getVideoById: videoHistory.getVideoById,
    notifyMomentAdded,
    subscribeMomentUpdates,
    captureMoment,
    getMomentsForVideo,
    deleteMomentFromVideo,
    getAllMoments,
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
