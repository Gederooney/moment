import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/idGenerator';
import debounce from 'lodash.debounce';
import { Logger } from '../services/logger/Logger';

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
  playlists: Playlist[];
  currentState: PlaylistState;
  isLoading: boolean;
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
  setActivePlaylist: (playlistId: string | null) => void;
  playVideoAtIndex: (index: number) => void;
  playNext: () => PlaylistVideo | null;
  playPrevious: () => PlaylistVideo | null;
  toggleAutoPlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
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

function createDefaultState(): PlaylistState {
  return {
    currentPlaylist: null,
    currentVideoIndex: 0,
    isPlaying: false,
    autoPlay: true,
    shuffle: false,
    repeat: false,
  };
}

function restoreCurrentPlaylistState(
  parsedState: PlaylistState,
  playlists: Playlist[]
): PlaylistState {
  if (!parsedState.currentPlaylist) return parsedState;

  const playlist = playlists.find((p: Playlist) => p.id === parsedState.currentPlaylist?.id);
  if (playlist) {
    parsedState.currentPlaylist = playlist;
  } else {
    parsedState.currentPlaylist = null;
    parsedState.currentVideoIndex = 0;
  }
  return parsedState;
}

function removeVideoFromPlaylistVideos(
  prevPlaylists: Playlist[],
  playlistId: string,
  videoId: string
): Playlist[] {
  return prevPlaylists.map(playlist =>
    playlist.id === playlistId
      ? {
          ...playlist,
          videos: playlist.videos.filter(v => v.videoId !== videoId),
          updatedAt: Date.now(),
        }
      : playlist
  );
}

function calculateShuffleNextIndex(
  videos: PlaylistVideo[],
  currentIndex: number
): number | null {
  const availableIndices = videos
    .map((_, i) => i)
    .filter(i => i !== currentIndex);

  if (availableIndices.length === 0) return null;
  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
}

function calculateNextIndex(
  currentIndex: number,
  videosLength: number,
  shuffle: boolean,
  repeat: boolean,
  videos: PlaylistVideo[]
): number | null {
  if (shuffle) return calculateShuffleNextIndex(videos, currentIndex);

  const nextIndex = currentIndex + 1;
  if (nextIndex >= videosLength) {
    return repeat ? 0 : null;
  }
  return nextIndex;
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentState, setCurrentState] = useState<PlaylistState>(createDefaultState());
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [playlistsData, stateData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STATE),
      ]);

      const parsedPlaylists = playlistsData ? JSON.parse(playlistsData) : [];
      setPlaylists(parsedPlaylists);

      if (stateData) {
        const parsedState = JSON.parse(stateData);
        const restoredState = restoreCurrentPlaylistState(parsedState, parsedPlaylists);
        setCurrentState(restoredState);
      }
    } catch (error) {
      Logger.error('PlaylistContext.loadData', error instanceof Error ? error : 'Failed to load playlist data');
      setPlaylists([]);
      setCurrentState(createDefaultState());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const debouncedSavePlaylists = useRef(
    debounce(async (playlistsToSave: Playlist[]) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlistsToSave));
      } catch (error) {
        Logger.error('PlaylistContext.savePlaylists', error instanceof Error ? error : 'Failed to save playlists');
      }
    }, 500)
  ).current;

  const debouncedSaveCurrentState = useRef(
    debounce(async (stateToSave: PlaylistState) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(stateToSave));
      } catch (error) {
        Logger.error('PlaylistContext.saveCurrentState', error instanceof Error ? error : 'Failed to save current state');
      }
    }, 500)
  ).current;

  const savePlaylists = async () => {
    debouncedSavePlaylists(playlists);
  };

  const saveCurrentState = async () => {
    debouncedSaveCurrentState(currentState);
  };

  useEffect(() => {
    if (!isLoading) {
      savePlaylists();
    }
  }, [playlists, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCurrentState();
    }
  }, [currentState, isLoading]);

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

  const adjustVideoIndexAfterRemoval = (
    prevState: PlaylistState,
    playlistId: string,
    videoId: string
  ): PlaylistState => {
    if (prevState.currentPlaylist?.id !== playlistId) return prevState;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return prevState;

    const videoIndex = playlist.videos.findIndex(v => v.videoId === videoId);
    if (videoIndex === -1 || videoIndex > prevState.currentVideoIndex) return prevState;

    return {
      ...prevState,
      currentVideoIndex: Math.max(0, prevState.currentVideoIndex - 1),
    };
  };

  const removeVideoFromPlaylist = useCallback(
    async (playlistId: string, videoId: string): Promise<void> => {
      setPlaylists(prev => removeVideoFromPlaylistVideos(prev, playlistId, videoId));
      setCurrentState(prev => adjustVideoIndexAfterRemoval(prev, playlistId, videoId));
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
    const nextIndex = calculateNextIndex(
      currentState.currentVideoIndex,
      videos.length,
      currentState.shuffle,
      currentState.repeat,
      videos
    );

    if (nextIndex === null) return null;

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
