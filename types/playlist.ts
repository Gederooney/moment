export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: PlaylistVideo[];
  createdAt: Date;
  updatedAt: Date;
  currentIndex: number;
  isActive: boolean;
  settings: PlaylistSettings;
}

export interface PlaylistVideo {
  id: string;
  videoId: string;
  title: string;
  author?: string;
  thumbnail?: string;
  url: string;
  duration?: number;
  order: number;
  addedAt: Date;
}

export interface PlaylistSettings {
  autoPlay: boolean;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

export interface PlaylistState {
  playlists: Playlist[];
  activePlaylist?: Playlist;
  currentVideoIndex: number;
  isPlaying: boolean;
}

export interface PlaylistActions {
  createPlaylist: (name: string, description?: string) => Promise<string>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addVideoToPlaylist: (
    playlistId: string,
    video: Omit<PlaylistVideo, 'id' | 'order' | 'addedAt'>
  ) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  reorderVideos: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  setActivePlaylist: (playlistId: string) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: (playlistId: string) => Promise<void>;
  setRepeatMode: (playlistId: string, mode: 'none' | 'one' | 'all') => Promise<void>;
  setIsPlaying: (isPlaying: boolean) => void;
  loadPlaylists: () => Promise<void>;
  clearActivePlaylist: () => void;
}

export interface PlaylistContextType extends PlaylistState, PlaylistActions {}

export interface PlaylistMetrics {
  totalDuration: number;
  totalVideos: number;
  remainingDuration: number;
  remainingVideos: number;
  completionPercentage: number;
}
