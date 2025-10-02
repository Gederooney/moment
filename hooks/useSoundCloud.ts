/**
 * Hook React pour gérer l'authentification et les API SoundCloud
 */

import { useState, useEffect, useCallback } from 'react';
import { SoundCloudAuth } from '../services/music/soundcloud/SoundCloudAuth';
import { SoundCloudAPI } from '../services/music/soundcloud/SoundCloudAPI';
import { SoundCloudPlayer } from '../services/music/soundcloud/SoundCloudPlayer';
import {
  MusicTrack,
  SearchResult,
  PlaybackState,
  MusicServiceError,
} from '../services/music/common/types';
import { Logger } from '../services/logger/Logger';

const CONTEXT = 'useSoundCloud';

interface UseSoundCloudReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  searchTracks: (query: string) => Promise<SearchResult>;
  play: (track: MusicTrack, positionMs?: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  stop: () => Promise<void>;
  getCurrentTrack: () => Promise<PlaybackState>;
}

export function useSoundCloud(): UseSoundCloudReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le player au montage
  useEffect(() => {
    initializePlayer();
    checkAuth();
  }, []);

  const initializePlayer = async () => {
    try {
      await SoundCloudPlayer.initialize();
      Logger.info(CONTEXT, 'Player initialized');
    } catch (err) {
      Logger.error(CONTEXT, 'Player initialization failed', err);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await SoundCloudAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (err) {
      Logger.error(CONTEXT, 'Auth check failed', err);
      setError('Failed to check authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await SoundCloudAuth.login();
      setIsAuthenticated(true);

      Logger.info(CONTEXT, 'Login successful');
    } catch (err: any) {
      const errorMessage =
        err instanceof MusicServiceError
          ? err.message
          : 'Login failed';
      setError(errorMessage);
      Logger.error(CONTEXT, 'Login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await SoundCloudPlayer.stop();
      await SoundCloudAuth.logout();
      setIsAuthenticated(false);
      Logger.info(CONTEXT, 'Logout successful');
    } catch (err) {
      setError('Logout failed');
      Logger.error(CONTEXT, 'Logout failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchTracks = useCallback(async (query: string): Promise<SearchResult> => {
    try {
      setError(null);
      return await SoundCloudAPI.searchTracks(query);
    } catch (err: any) {
      const errorMessage =
        err instanceof MusicServiceError
          ? err.message
          : 'Search failed';
      setError(errorMessage);
      Logger.error(CONTEXT, 'Search failed', err);
      throw err;
    }
  }, []);

  const play = useCallback(async (track: MusicTrack, positionMs = 0) => {
    try {
      setError(null);
      await SoundCloudPlayer.play(track, positionMs);
    } catch (err: any) {
      const errorMessage =
        err instanceof MusicServiceError
          ? err.message
          : 'Playback failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      setError(null);
      await SoundCloudPlayer.pause();
    } catch (err) {
      setError('Pause failed');
      throw err;
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      setError(null);
      await SoundCloudPlayer.resume();
    } catch (err) {
      setError('Resume failed');
      throw err;
    }
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    try {
      setError(null);
      await SoundCloudPlayer.seek(positionMs);
    } catch (err) {
      setError('Seek failed');
      throw err;
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      setError(null);
      await SoundCloudPlayer.stop();
    } catch (err) {
      setError('Stop failed');
      throw err;
    }
  }, []);

  const getCurrentTrack = useCallback(async (): Promise<PlaybackState> => {
    try {
      setError(null);
      return await SoundCloudPlayer.getCurrentTrack();
    } catch (err) {
      setError('Failed to get current track');
      throw err;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    searchTracks,
    play,
    pause,
    resume,
    seek,
    stop,
    getCurrentTrack,
  };
}
