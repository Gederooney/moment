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

function validateYouTubeUrl(url: string): void {
  if (!YouTubeService.isValidYouTubeUrl(url)) {
    throw new Error('URL YouTube invalide');
  }
}

async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  return await YouTubeService.getVideoInfo(url);
}

async function startVideoProcessing(url: string): Promise<ProcessingResult> {
  return await YouTubeService.processVideo(url);
}

function createHistoryItem(
  jobId: string,
  info: VideoInfo,
  url: string,
  audioUrl: string
): DownloadHistory {
  return {
    id: jobId,
    title: info.title,
    originalUrl: url,
    audioUrl: audioUrl,
    thumbnail: info.thumbnail,
    downloadDate: new Date().toISOString(),
    duration: info.duration,
    author: info.author,
  };
}

async function handleCompletedJob(
  result: ProcessingResult,
  info: VideoInfo,
  url: string
): Promise<void> {
  if (result.status === 'completed' && result.audioUrl) {
    const historyItem = createHistoryItem(result.jobId, info, url, result.audioUrl);
    await StorageService.addToHistory(historyItem);
  }
}

function createPollJobFunction(
  jobId: string,
  info: VideoInfo,
  url: string,
  setProcessingResult: (result: ProcessingResult) => void,
  setError: (error: string | null) => void
) {
  return async () => {
    try {
      const finalResult = await YouTubeService.checkJobStatus(jobId);
      setProcessingResult(finalResult);
      await handleCompletedJob(finalResult, info, url);
    } catch (pollError) {
      setError('Erreur lors du traitement de la vidéo');
    }
  };
}

function schedulePollIfPending(
  result: ProcessingResult,
  info: VideoInfo,
  url: string,
  setProcessingResult: (result: ProcessingResult) => void,
  setError: (error: string | null) => void
): void {
  if (result.status === 'pending') {
    const pollJob = createPollJobFunction(result.jobId, info, url, setProcessingResult, setError);
    setTimeout(pollJob, 3000);
  }
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

      validateYouTubeUrl(url);
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);

      const result = await startVideoProcessing(url);
      setProcessingResult(result);

      schedulePollIfPending(result, info, url, setProcessingResult, setError);
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
