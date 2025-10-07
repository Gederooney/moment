/**
 * Screen Recording types for capturing screen moments from TikTok, Instagram, etc.
 */

export type RecordingQuality = 'low' | 'medium' | 'high';

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping' | 'error';

export interface RecordingConfig {
  captureDuration: number; // duration in seconds (30, 60, 180, 300)
  quality: RecordingQuality;
  autoCompress: boolean;
  maxBufferDuration: number; // max seconds to keep in buffer (default 300 = 5 min)
}

export interface RecordingBuffer {
  chunks: RecordingChunk[];
  totalDuration: number; // total seconds in buffer
  maxDuration: number; // max seconds allowed
  currentSize: number; // current size in bytes
  maxSize: number; // max size in bytes (e.g., 200MB)
}

export interface RecordingChunk {
  id: string;
  data: string; // base64 or file path
  duration: number; // seconds
  timestamp: Date;
  size: number; // bytes
}

export interface ScreenRecordingState {
  status: RecordingStatus;
  isRecording: boolean;
  recordingDuration: number; // current recording duration in seconds
  config: RecordingConfig;
  buffer: RecordingBuffer;
  error?: string;
  currentRecordingId?: string;
}

export interface ScreenRecordingMoment {
  id: string;
  type: 'screen_recording';
  videoFilePath: string; // local file path
  duration: number; // clip duration in seconds
  title: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  sourceApp?: string; // 'TikTok', 'Instagram', etc. (if detectable)
  thumbnailPath?: string; // path to thumbnail image
  fileSize: number; // bytes
}

export interface ScreenRecordingActions {
  startRecording: (config?: Partial<RecordingConfig>) => Promise<void>;
  stopRecording: () => Promise<void>;
  captureLastNMinutes: (durationInSeconds: number) => Promise<ScreenRecordingMoment>;
  clearBuffer: () => Promise<void>;
  updateConfig: (config: Partial<RecordingConfig>) => Promise<void>;
}

export interface ScreenRecordingContextType extends ScreenRecordingState, ScreenRecordingActions {}

/**
 * Platform-specific recording info
 */
export interface PlatformRecordingInfo {
  platform: 'ios' | 'android';
  supportsBackgroundRecording: boolean;
  supportsFloatingButton: boolean;
  maxRecordingDuration?: number; // platform limit in seconds
  requiresPermissions: string[]; // list of required permissions
}

/**
 * Floating button configuration (Android)
 */
export interface FloatingButtonConfig {
  visible: boolean;
  position: { x: number; y: number };
  size: number; // diameter in pixels
  opacity: number; // 0-1
}
