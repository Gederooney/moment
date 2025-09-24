/**
 * Queue Component Types
 * TypeScript type definitions for the queue system
 */

// Import and re-export the main video item type
import type { QueueVideoItem } from './QueueItem';
export type { QueueVideoItem } from './QueueItem';

// Queue state management types
export interface QueueState {
  videos: QueueVideoItem[];
  currentVideoId?: string;
  isPlaying: boolean;
  isLoading: boolean;
}

// Queue actions for state management
export type QueueAction =
  | { type: 'ADD_VIDEO'; payload: QueueVideoItem }
  | { type: 'REMOVE_VIDEO'; payload: string } // video id
  | { type: 'SET_CURRENT_VIDEO'; payload: string } // video id
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REORDER_VIDEOS'; payload: QueueVideoItem[] }
  | { type: 'CLEAR_QUEUE' };

// YouTube API response types (for future integration)
export interface YouTubeVideoInfo {
  id: string;
  title: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  duration: string;
  channelName: string;
  viewCount?: number;
  publishedAt?: string;
}

// Error types for queue operations
export interface QueueError {
  type: 'INVALID_URL' | 'NETWORK_ERROR' | 'VIDEO_NOT_FOUND' | 'QUOTA_EXCEEDED';
  message: string;
  url?: string;
}

// Configuration types
export interface QueueConfig {
  maxVideos: number;
  autoPlay: boolean;
  shuffleMode: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

// Event callback types
export type VideoEventCallback = (video: QueueVideoItem) => void;
export type ErrorEventCallback = (error: QueueError) => void;
export type AddVideoCallback = (url: string) => Promise<void> | void;