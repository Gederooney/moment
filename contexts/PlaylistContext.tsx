import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlaylistVideo {
  id: string;
  videoId: string;
  title: string;
  author?: string;
  thumbnail?: string;
  url: string;
  duration?: number;
  addedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: PlaylistVideo[];
  createdAt: number;
  updatedAt: number;
  isActive?: boolean;
}

export interface PlaylistState {
  currentPlaylist: Playlist | null;
  currentVideoIndex: number;
  isPlaying: boolean;
  autoPlay: boolean;
  shuffle: boolean;
  repeat: boolean;
}

interface PlaylistContextType {
  // State
  playlists: Playlist[];
  currentState: PlaylistState;
  isLoading: boolean;

  // Playlist management
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updatePlaylist: (
    playlistId: string,
    updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>
  ) => Promise<void>;
  addVideoToPlaylist: (
    playlistId: string,
    video: Omit<PlaylistVideo, 'id' | 'addedAt'>
  ) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  reorderPlaylistVideos: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;

  // Playback control
  setActivePlaylist: (playlistId: string | null) => void;
  playVideoAtIndex: (index: number) => void;
  playNext: () => PlaylistVideo | null;
  playPrevious: () => PlaylistVideo | null;
  toggleAutoPlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  // Getters
  getCurrentVideo: () => PlaylistVideo | null;
  getNextVideo: () => PlaylistVideo | null;
  getPreviousVideo: () => PlaylistVideo | null;
  hasNext: () => boolean;
  hasPrevious: () => boolean;
  getPlaylistProgress: () => { current: number; total: number } | null;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLAYLISTS: '@podcut_playlists',
  CURRENT_STATE: '@podcut_playlist_state',
};

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentState, setCurrentState] = useState<PlaylistState>({
    currentPlaylist: null,
    currentVideoIndex: 0,
    isPlaying: false,
    autoPlay: true,
    shuffle: false,
    repeat: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    loadData();
  }, []);

  // Save playlists to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      savePlaylists();
    }
  }, [playlists, isLoading]);

  // Save current state to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCurrentState();
    }
  }, [currentState, isLoading]);

  const loadData = async () => {
    try {
      const [playlistsData, stateData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STATE),
      ]);

      let parsedPlaylists: Playlist[] = [];
      if (playlistsData) {
        parsedPlaylists = JSON.parse(playlistsData);
        setPlaylists(parsedPlaylists);
      }

      if (stateData) {
        const parsedState = JSON.parse(stateData);
        // Find the current playlist in loaded playlists
        if (parsedState.currentPlaylist) {
          const playlist = parsedPlaylists?.find(
            (p: Playlist) => p.id === parsedState.currentPlaylist.id
          );
          if (playlist) {
            parsedState.currentPlaylist = playlist;
          } else {
            parsedState.currentPlaylist = null;
            parsedState.currentVideoIndex = 0;
          }
        }
        setCurrentState(parsedState);
      }
    } catch (error) {
      console.error('Error loading playlist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlaylists = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const saveCurrentState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(currentState));
    } catch (error) {
      console.error('Error saving current state:', error);
    }
  };

  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createPlaylist = useCallback(
    async (name: string, description?: string): Promise<Playlist> => {
      const playlist: Playlist = {
        id: generateId(),
        name,
        description,
        videos: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setPlaylists(prev => [...prev, playlist]);
      return playlist;
    },
    []
  );

  const deletePlaylist = useCallback(async (playlistId: string): Promise<void> => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));

    // Clear current playlist if it's the one being deleted
    setCurrentState(prev => {
      if (prev.currentPlaylist?.id === playlistId) {
        return {
          ...prev,
          currentPlaylist: null,
          currentVideoIndex: 0,
        };
      }
      return prev;
    });
  }, []);

  const updatePlaylist = useCallback(
    async (
      playlistId: string,
      updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>
    ): Promise<void> => {
      setPlaylists(prev =>
        prev.map(playlist =>
          playlist.id === playlistId ? { ...playlist, ...updates, updatedAt: Date.now() } : playlist
        )
      );
    },
    []
  );

  const addVideoToPlaylist = useCallback(
    async (playlistId: string, video: Omit<PlaylistVideo, 'id' | 'addedAt'>): Promise<void> => {
      const newVideo: PlaylistVideo = {
        ...video,
        id: generateId(),
        addedAt: Date.now(),
      };

      setPlaylists(prev =>
        prev.map(playlist =>
          playlist.id === playlistId
            ? {
                ...playlist,
                videos: [...playlist.videos, newVideo],
                updatedAt: Date.now(),
              }
            : playlist
        )
      );
    },
    []
  );

  const removeVideoFromPlaylist = useCallback(
    async (playlistId: string, videoId: string): Promise<void> => {
      setPlaylists(prev =>
        prev.map(playlist =>
          playlist.id === playlistId
            ? {
                ...playlist,
                videos: playlist.videos.filter(v => v.videoId !== videoId),
                updatedAt: Date.now(),
              }
            : playlist
        )
      );

      // Adjust current video index if needed
      setCurrentState(prev => {
        if (prev.currentPlaylist?.id === playlistId) {
          const playlist = playlists.find(p => p.id === playlistId);
          if (playlist) {
            const videoIndex = playlist.videos.findIndex(v => v.videoId === videoId);
            if (videoIndex !== -1 && videoIndex <= prev.currentVideoIndex) {
              return {
                ...prev,
                currentVideoIndex: Math.max(0, prev.currentVideoIndex - 1),
              };
            }
          }
        }
        return prev;
      });
    },
    [playlists]
  );

  const reorderPlaylistVideos = useCallback(
    async (playlistId: string, fromIndex: number, toIndex: number): Promise<void> => {
      setPlaylists(prev =>
        prev.map(playlist => {
          if (playlist.id === playlistId) {
            const videos = [...playlist.videos];
            const [movedVideo] = videos.splice(fromIndex, 1);
            videos.splice(toIndex, 0, movedVideo);
            return { ...playlist, videos, updatedAt: Date.now() };
          }
          return playlist;
        })
      );
    },
    []
  );

  const setActivePlaylist = useCallback(
    (playlistId: string | null) => {
      if (!playlistId) {
        setCurrentState(prev => ({
          ...prev,
          currentPlaylist: null,
          currentVideoIndex: 0,
        }));
        return;
      }

      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        setCurrentState(prev => ({
          ...prev,
          currentPlaylist: playlist,
          currentVideoIndex: 0,
        }));
      }
    },
    [playlists]
  );

  const playVideoAtIndex = useCallback((index: number) => {
    setCurrentState(prev => {
      if (prev.currentPlaylist && index >= 0 && index < prev.currentPlaylist.videos.length) {
        return { ...prev, currentVideoIndex: index };
      }
      return prev;
    });
  }, []);

  const playNext = useCallback((): PlaylistVideo | null => {
    if (!currentState.currentPlaylist) return null;

    const { videos } = currentState.currentPlaylist;
    let nextIndex = currentState.currentVideoIndex + 1;

    if (currentState.shuffle) {
      // Simple shuffle: random video excluding current
      const availableIndices = videos
        .map((_, i) => i)
        .filter(i => i !== currentState.currentVideoIndex);
      if (availableIndices.length > 0) {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        return null;
      }
    } else if (nextIndex >= videos.length) {
      if (currentState.repeat) {
        nextIndex = 0;
      } else {
        return null;
      }
    }

    const nextVideo = videos[nextIndex];
    if (nextVideo) {
      setCurrentState(prev => ({ ...prev, currentVideoIndex: nextIndex }));
      return nextVideo;
    }

    return null;
  }, [currentState]);

  const playPrevious = useCallback((): PlaylistVideo | null => {
    if (!currentState.currentPlaylist) return null;

    const { videos } = currentState.currentPlaylist;
    let prevIndex = currentState.currentVideoIndex - 1;

    if (prevIndex < 0) {
      if (currentState.repeat) {
        prevIndex = videos.length - 1;
      } else {
        return null;
      }
    }

    const prevVideo = videos[prevIndex];
    if (prevVideo) {
      setCurrentState(prev => ({ ...prev, currentVideoIndex: prevIndex }));
      return prevVideo;
    }

    return null;
  }, [currentState]);

  const toggleAutoPlay = useCallback(() => {
    setCurrentState(prev => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setCurrentState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setCurrentState(prev => ({ ...prev, repeat: !prev.repeat }));
  }, []);

  const getCurrentVideo = useCallback((): PlaylistVideo | null => {
    if (!currentState.currentPlaylist) return null;
    return currentState.currentPlaylist.videos[currentState.currentVideoIndex] || null;
  }, [currentState]);

  const getNextVideo = useCallback((): PlaylistVideo | null => {
    if (!currentState.currentPlaylist) return null;

    const { videos } = currentState.currentPlaylist;
    let nextIndex = currentState.currentVideoIndex + 1;

    if (nextIndex >= videos.length) {
      if (currentState.repeat) {
        nextIndex = 0;
      } else {
        return null;
      }
    }

    return videos[nextIndex] || null;
  }, [currentState]);

  const getPreviousVideo = useCallback((): PlaylistVideo | null => {
    if (!currentState.currentPlaylist) return null;

    const { videos } = currentState.currentPlaylist;
    let prevIndex = currentState.currentVideoIndex - 1;

    if (prevIndex < 0) {
      if (currentState.repeat) {
        prevIndex = videos.length - 1;
      } else {
        return null;
      }
    }

    return videos[prevIndex] || null;
  }, [currentState]);

  const hasNext = useCallback((): boolean => {
    if (!currentState.currentPlaylist) return false;

    const nextIndex = currentState.currentVideoIndex + 1;
    return nextIndex < currentState.currentPlaylist.videos.length || currentState.repeat;
  }, [currentState]);

  const hasPrevious = useCallback((): boolean => {
    if (!currentState.currentPlaylist) return false;

    return currentState.currentVideoIndex > 0 || currentState.repeat;
  }, [currentState]);

  const getPlaylistProgress = useCallback((): { current: number; total: number } | null => {
    if (!currentState.currentPlaylist) return null;

    return {
      current: currentState.currentVideoIndex + 1,
      total: currentState.currentPlaylist.videos.length,
    };
  }, [currentState]);

  const value: PlaylistContextType = {
    playlists,
    currentState,
    isLoading,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    reorderPlaylistVideos,
    setActivePlaylist,
    playVideoAtIndex,
    playNext,
    playPrevious,
    toggleAutoPlay,
    toggleShuffle,
    toggleRepeat,
    getCurrentVideo,
    getNextVideo,
    getPreviousVideo,
    hasNext,
    hasPrevious,
    getPlaylistProgress,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
