/**
 * Hook personnalisé pour l'authentification
 *
 * Simplifie l'utilisation du contexte d'authentification
 * et expose des méthodes utilitaires supplémentaires
 */

import { useMemo, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { MusicService } from '../types/auth.types';

/**
 * Type de retour du hook useAuth
 */
export interface UseAuthReturn {
  // État global
  isRestoring: boolean; // Indique si les tokens sont en cours de restauration

  // État Spotify
  isSpotifyAuthenticated: boolean;
  isSpotifyLoading: boolean;
  spotifyError: string | null;
  spotifyUser: any;

  // Méthodes Spotify
  loginSpotify: () => Promise<void>;
  logoutSpotify: () => Promise<void>;

  // Méthodes génériques
  isAuthenticated: (service: MusicService) => boolean;
  getAccessToken: (service: MusicService) => Promise<string | null>;
  logout: (service: MusicService) => Promise<void>;
  logoutAll: () => Promise<void>;

  // Utilitaires
  hasAnyAuthentication: boolean;
}

/**
 * Hook useAuth
 *
 * Usage:
 * ```tsx
 * const {
 *   isSpotifyAuthenticated,
 *   loginSpotify,
 *   logoutSpotify,
 *   getAccessToken
 * } = useAuth();
 * ```
 */
export function useAuth(): UseAuthReturn {
  const context = useAuthContext();

  const {
    authState,
    isRestoring,
    loginSpotify,
    logoutSpotify,
    logout,
    isAuthenticated,
    getAccessToken,
    clearAllTokens,
  } = context;

  /**
   * Vérifie si au moins un service est authentifié (Spotify uniquement)
   */
  const hasAnyAuthentication = useMemo(() => {
    return authState.spotify.isAuthenticated;
  }, [authState]);

  /**
   * Déconnecte tous les services
   */
  const logoutAll = useCallback(async () => {
    await clearAllTokens();
  }, [clearAllTokens]);

  return {
    // État global
    isRestoring,

    // État Spotify
    isSpotifyAuthenticated: authState.spotify.isAuthenticated,
    isSpotifyLoading: authState.spotify.isLoading,
    spotifyError: authState.spotify.error,
    spotifyUser: authState.spotify.user,

    // Méthodes Spotify
    loginSpotify,
    logoutSpotify,

    // Méthodes génériques
    isAuthenticated,
    getAccessToken,
    logout,
    logoutAll,

    // Utilitaires
    hasAnyAuthentication,
  };
}

/**
 * Hook pour un service spécifique
 *
 * Usage:
 * ```tsx
 * const spotify = useServiceAuth(MusicService.SPOTIFY);
 * if (spotify.isAuthenticated) {
 *   const token = await spotify.getToken();
 * }
 * ```
 */
export function useServiceAuth(service: MusicService) {
  const context = useAuthContext();

  const serviceState = context.authState[service];

  const login = useCallback(async () => {
    await context.loginSpotify();
  }, [context]);

  const logout = useCallback(async () => {
    await context.logout(service);
  }, [context, service]);

  const refresh = useCallback(async () => {
    await context.refreshToken(service);
  }, [context, service]);

  const getToken = useCallback(async () => {
    return await context.getAccessToken(service);
  }, [context, service]);

  return {
    isAuthenticated: serviceState.isAuthenticated,
    isLoading: serviceState.isLoading,
    error: serviceState.error,
    user: serviceState.user,
    tokens: serviceState.tokens,
    login,
    logout,
    refresh,
    getToken,
  };
}

/**
 * Hook pour gérer l'état de chargement global
 *
 * Utile pour afficher un loader pendant les opérations d'auth
 */
export function useAuthLoading() {
  const { authState } = useAuthContext();

  const isLoading = useMemo(() => {
    return authState.spotify.isLoading;
  }, [authState]);

  return {
    isLoading,
    isSpotifyLoading: authState.spotify.isLoading,
  };
}

/**
 * Hook pour gérer les erreurs d'authentification
 *
 * Permet de centraliser la gestion des erreurs
 */
export function useAuthErrors() {
  const { authState } = useAuthContext();

  const hasErrors = useMemo(() => {
    return !!authState.spotify.error;
  }, [authState]);

  const errors = useMemo(() => {
    const errorList: { service: MusicService; error: string }[] = [];

    if (authState.spotify.error) {
      errorList.push({
        service: MusicService.SPOTIFY,
        error: authState.spotify.error,
      });
    }

    return errorList;
  }, [authState]);

  return {
    hasErrors,
    errors,
    spotifyError: authState.spotify.error,
  };
}
