/**
 * Hook React pour gérer l'authentification et les API Spotify avec OAuth PKCE
 */

import { useState, useEffect, useCallback } from 'react';
import { SpotifyAuth } from '../services/music/spotify/SpotifyAuth';
import { SpotifyAPI } from '../services/music/spotify/SpotifyAPI';
import { SpotifyPlayer } from '../services/music/spotify/SpotifyPlayer';
import {
  MusicTrack,
  SearchResult,
  PlaybackState,
  MusicServiceError,
} from '../services/music/common/types';
import { SpotifyUser } from '../services/music/spotify/types';
import { Logger } from '../services/logger/Logger';

const CONTEXT = 'useSpotifyOAuth';

interface UseSpotifyOAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SpotifyUser | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  searchTracks: (query: string) => Promise<SearchResult>;
  play: (trackUri: string, positionMs?: number) => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  getCurrentTrack: () => Promise<PlaybackState>;
}

export function useSpotifyOAuth(): UseSpotifyOAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await SpotifyAuth.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const profile = await SpotifyAPI.getUserProfile();
        setUser(profile);
      }
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

      await SpotifyAuth.login();
      const profile = await SpotifyAPI.getUserProfile();

      setUser(profile);
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
      await SpotifyAuth.logout();
      setUser(null);
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
      return await SpotifyAPI.searchTracks(query);
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

  const play = useCallback(async (trackUri: string, positionMs = 0) => {
    try {
      setError(null);
      await SpotifyPlayer.play(trackUri, positionMs);
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
      await SpotifyPlayer.pause();
    } catch (err) {
      setError('Pause failed');
      throw err;
    }
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    try {
      setError(null);
      await SpotifyPlayer.seek(positionMs);
    } catch (err) {
      setError('Seek failed');
      throw err;
    }
  }, []);

  const getCurrentTrack = useCallback(async (): Promise<PlaybackState> => {
    try {
      setError(null);
      return await SpotifyPlayer.getCurrentTrack();
    } catch (err) {
      setError('Failed to get current track');
      throw err;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    searchTracks,
    play,
    pause,
    seek,
    getCurrentTrack,
  };
}
