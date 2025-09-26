import { useState, useCallback } from 'react';
import { YouTubeService, VideoInfo, ProcessingResult } from '../services/youtubeService';
import { StorageService, DownloadHistory } from '../services/storageService';

export interface UseVideoProcessorResult {
  isLoading: boolean;
  videoInfo: VideoInfo | null;
  processingResult: ProcessingResult | null;
  error: string | null;
  processVideo: (url: string) => Promise<void>;
  reset: () => void;
}

export function useVideoProcessor(): UseVideoProcessorResult {
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processVideo = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setVideoInfo(null);
      setProcessingResult(null);

      // Validate URL
      if (!YouTubeService.isValidYouTubeUrl(url)) {
        throw new Error('URL YouTube invalide');
      }

      // Get video info
      const info = await YouTubeService.getVideoInfo(url);
      setVideoInfo(info);

      // Start processing
      const result = await YouTubeService.processVideo(url);
      setProcessingResult(result);

      // Poll for completion (simplified for demo)
      if (result.status === 'pending') {
        setTimeout(async () => {
          try {
            const finalResult = await YouTubeService.checkJobStatus(result.jobId);
            setProcessingResult(finalResult);

            // Add to history if completed
            if (finalResult.status === 'completed' && finalResult.audioUrl) {
              const historyItem: DownloadHistory = {
                id: result.jobId,
                title: info.title,
                originalUrl: url,
                audioUrl: finalResult.audioUrl,
                thumbnail: info.thumbnail,
                downloadDate: new Date().toISOString(),
                duration: info.duration,
                author: info.author,
              };

              await StorageService.addToHistory(historyItem);
            }
          } catch (pollError) {
            setError('Erreur lors du traitement de la vidéo');
          }
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setVideoInfo(null);
    setProcessingResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    videoInfo,
    processingResult,
    error,
    processVideo,
    reset,
  };
}
