/**
 * DEPRECATED: Old moment format - kept for migration purposes only
 * Use Moment (YouTubeMoment | ScreenRecordingMoment) instead
 */
export interface CapturedMoment {
  id: string;
  timestamp: number; // en secondes
  duration: number; // durée du moment en secondes (par défaut 30s)
  title: string;
  videoId: string;
  createdAt: Date;
  notes?: string; // Markdown notes
  tags?: string[]; // Tags for organization
}

/**
 * Moment types for discriminated union
 */
export type MomentType = 'youtube_timestamp' | 'screen_recording';

/**
 * Base moment interface with common fields
 */
export interface BaseMoment {
  id: string;
  type: MomentType;
  title: string;
  notes?: string; // markdown format
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * YouTube timestamp moment
 */
export interface YouTubeMoment extends BaseMoment {
  type: 'youtube_timestamp';
  videoId: string;
  timestamp: number; // seconds
  duration: number; // duration of moment in seconds (default 30s)
  videoMetadata: {
    title: string;
    author?: string;
    thumbnail: string;
    url: string;
  };
}

/**
 * Screen recording moment (video clip)
 */
export interface ScreenRecordingMoment extends BaseMoment {
  type: 'screen_recording';
  videoFilePath: string; // local file path
  duration: number; // clip duration in seconds
  sourceApp?: string; // 'TikTok', 'Instagram', etc.
  thumbnailPath?: string;
  fileSize: number; // bytes
}

/**
 * Union type for all moment types
 */
export type Moment = YouTubeMoment | ScreenRecordingMoment;

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
}

export interface VideoWithMoments {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  addedAt: Date;
  moments: CapturedMoment[];
  // Nouvelles métadonnées enrichies
  author?: string;
  thumbnailFromApi?: string;
  metadataLoadedFromApi?: boolean;
}
