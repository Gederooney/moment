export interface CapturedMoment {
  id: string;
  timestamp: number; // en secondes
  duration: number; // durée du moment en secondes (par défaut 30s)
  title: string;
  videoId: string;
  createdAt: Date;
}

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