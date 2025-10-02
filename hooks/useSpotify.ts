/**
 * Hook React pour Spotify
 * Simplifie l'utilisation des services Spotify dans les composants
 */

import { useState, useEffect, useCallback } from 'react';
import { SpotifyAuth, SpotifyAPI, SpotifyPlayer } from '../services/audio/spotify';
import { SpotifyTrack, SpotifyUserProfile } from '../services/audio/spotify/types';
import { SPOTIFY_CONFIG } from '../config/spotify.config';
import { Logger } from '../services/logger/Logger';

export const useSpotify = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);

  const auth = SpotifyAuth.getInstance(SPOTIFY_CONFIG);
  const api = SpotifyAPI.getInstance(auth);
  const player = SpotifyPlayer.getInstance(auth, api);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      await loadUserProfile();
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await api.getUserProfile();
      setUserProfile(profile);
      setIsPremium(profile.product === 'premium');
    } catch (error) {
      Logger.error('useSpotify.loadUserProfile', error as Error);
    }
  };

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      await auth.authenticate();
      await checkAuthStatus();
    } catch (error) {
      Logger.error('useSpotify.login', error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
      setIsPremium(false);
    } catch (error) {
      Logger.error('useSpotify.logout', error as Error);
      throw error;
    }
  }, []);

  const search = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    try {
      return await api.search(query);
    } catch (error) {
      Logger.error('useSpotify.search', error as Error);
      return [];
    }
  }, []);

  const play = useCallback(async (trackUri: string) => {
    try {
      await player.play(trackUri);
    } catch (error) {
      Logger.error('useSpotify.play', error as Error);
      throw error;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    isPremium,
    userProfile,
    login,
    logout,
    search,
    play,
    api,
    player,
  };
};
