/**
 * Context d'authentification unifié pour Spotify et SoundCloud
 *
 * Fonctionnalités:
 * - Gestion centralisée de l'authentification
 * - Auto-refresh des tokens
 * - Persistance sécurisée
 * - État réactif pour toute l'application
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthState,
  AuthContextType,
  MusicService,
  ServiceAuthState,
  AuthUser,
  AuthToken,
  AuthError,
  AuthErrorCode,
} from '../types/auth.types';
import { SpotifyAuth } from '../services/music/spotify/SpotifyAuth';
import { SpotifyAPI } from '../services/music/spotify/SpotifyAPI';
import { SecureStorage } from '../services/music/common/SecureStorage';
import { OAuthTokens } from '../services/music/common/types';
import { AUTO_REFRESH_CONFIG, spotifyConfig } from '../config/oauth.config';
import { Logger } from '../services/logger/Logger';

const CONTEXT = 'AuthContext';

/**
 * État initial pour un service non authentifié
 */
const initialServiceState: ServiceAuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: null,
  user: null,
};

/**
 * État initial du contexte
 */
const initialAuthState: AuthState = {
  spotify: initialServiceState,
};

/**
 * Contexte d'authentification
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props du provider
 */
interface AuthProviderProps {
  children: ReactNode;
  autoRefresh?: boolean; // Activer le refresh automatique
}

/**
 * Provider du contexte d'authentification
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  autoRefresh = true,
}) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isRestoring, setIsRestoring] = useState(true); // True au démarrage

  /**
   * Met à jour l'état d'un service spécifique
   */
  const updateServiceState = useCallback(
    (service: MusicService, updates: Partial<ServiceAuthState>) => {
      setAuthState((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          ...updates,
        },
      }));
    },
    []
  );

  /**
   * Configure les services OAuth au montage
   */
  useEffect(() => {
    // Configure Spotify OAuth
    SpotifyAuth.configure(spotifyConfig.clientId, spotifyConfig.redirectUri);

    Logger.info(CONTEXT, 'Spotify OAuth configured');
  }, []);

  /**
   * Restaure les tokens sauvegardés au montage
   */
  useEffect(() => {
    restoreTokens();
  }, []);

  /**
   * Setup du refresh automatique
   */
  useEffect(() => {
    if (!autoRefresh || !AUTO_REFRESH_CONFIG.enabled) {
      return;
    }

    const interval = setInterval(() => {
      checkAndRefreshTokens();
    }, 60 * 1000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [autoRefresh, authState]);

  /**
   * Restaure les tokens depuis le storage au démarrage
   */
  const restoreTokens = async () => {
    try {
      setIsRestoring(true); // Marquer le début de la restauration
      Logger.info(CONTEXT, 'Restoring tokens from storage');

      // Restaurer Spotify uniquement
      const spotifyToken = await SecureStorage.getTokens('spotify');
      if (spotifyToken) {
        // Simple validation: check if token exists and not expired
        const isExpired = SecureStorage.isTokenExpired(spotifyToken);
        if (!isExpired) {
          updateServiceState(MusicService.SPOTIFY, {
            isAuthenticated: true,
            tokens: spotifyToken,
          });

          // Initialize SpotifyAPI client with existing tokens
          SpotifyAPI.initialize();

          // Don't load profile on restore - causes timing issues with SecureStorage
          // Profile will be loaded only after fresh login
        }
      }

      Logger.info(CONTEXT, 'Tokens restored successfully');
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to restore tokens', error);
    } finally {
      setIsRestoring(false); // Fin de la restauration
    }
  };

  /**
   * Vérifie et rafraîchit les tokens si nécessaire
   */
  const checkAndRefreshTokens = async () => {
    // Spotify uniquement
    if (authState.spotify.isAuthenticated && authState.spotify.tokens) {
      const needsRefresh = SecureStorage.isTokenExpired(authState.spotify.tokens);
      if (needsRefresh && authState.spotify.tokens.refreshToken) {
        try {
          await refreshSpotifyToken();
        } catch (error) {
          Logger.error(CONTEXT, 'Auto-refresh failed for Spotify', error);
        }
      }
    }
  };

  /**
   * Login Spotify
   */
  const loginSpotify = async () => {
    try {
      updateServiceState(MusicService.SPOTIFY, { isLoading: true, error: null });

      const tokens = await SpotifyAuth.login();
      await SecureStorage.saveTokens('spotify', tokens);

      // Initialize SpotifyAPI client with the new tokens
      SpotifyAPI.initialize();

      // Charger le profil utilisateur
      try {
        const userProfile = await SpotifyAPI.getUserProfile();
        const user: AuthUser = {
          id: userProfile.id,
          displayName: userProfile.display_name,
          email: userProfile.email,
          imageUrl: userProfile.images?.[0]?.url,
          service: MusicService.SPOTIFY,
        };

        updateServiceState(MusicService.SPOTIFY, {
          isAuthenticated: true,
          isLoading: false,
          tokens,
          user,
          error: null,
        });
      } catch (error) {
        Logger.warn(CONTEXT, 'Could not load user profile, continuing without it');
        // Continue without profile if it fails
        updateServiceState(MusicService.SPOTIFY, {
          isAuthenticated: true,
          isLoading: false,
          tokens,
          user: null,
          error: null,
        });
      }

      Logger.info(CONTEXT, 'Spotify login successful');
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateServiceState(MusicService.SPOTIFY, {
        isLoading: false,
        error: errorMessage,
      });
      Logger.error(CONTEXT, 'Spotify login failed', error);
      throw error;
    }
  };

  /**
   * Logout Spotify
   */
  const logoutSpotify = async () => {
    try {
      await SpotifyAuth.logout();
      await SecureStorage.deleteTokens('spotify');

      updateServiceState(MusicService.SPOTIFY, {
        ...initialServiceState,
      });

      Logger.info(CONTEXT, 'Spotify logout successful');
    } catch (error) {
      Logger.error(CONTEXT, 'Spotify logout failed', error);
      throw error;
    }
  };

  /**
   * Refresh token Spotify
   */
  const refreshSpotifyToken = async () => {
    try {
      const currentTokens = authState.spotify.tokens;
      if (!currentTokens?.refreshToken) {
        throw new AuthError(
          'No refresh token available',
          AuthErrorCode.TOKEN_REFRESH_FAILED,
          MusicService.SPOTIFY
        );
      }

      Logger.info(CONTEXT, 'Refreshing Spotify token');

      const newTokens = await SpotifyAuth.refreshToken(currentTokens.refreshToken);
      await SecureStorage.saveTokens('spotify', newTokens);

      updateServiceState(MusicService.SPOTIFY, {
        tokens: newTokens,
      });

      Logger.info(CONTEXT, 'Spotify token refreshed successfully');
    } catch (error) {
      Logger.error(CONTEXT, 'Spotify token refresh failed', error);
      throw error;
    }
  };

  /**
   * Logout générique (Spotify uniquement)
   */
  const logout = async (service: MusicService) => {
    await logoutSpotify();
  };

  /**
   * Refresh générique (Spotify uniquement)
   */
  const refreshToken = async (service: MusicService) => {
    await refreshSpotifyToken();
  };

  /**
   * Vérifie si un service est authentifié
   */
  const isAuthenticated = (service: MusicService): boolean => {
    return authState[service].isAuthenticated;
  };

  /**
   * Récupère un access token valide
   */
  const getAccessToken = async (
    service: MusicService
  ): Promise<string | null> => {
    const serviceState = authState[service];

    if (!serviceState.isAuthenticated || !serviceState.tokens) {
      return null;
    }

    const isExpired = serviceState.tokens ? SecureStorage.isTokenExpired(serviceState.tokens) : true;

    // Token valide (non expiré)
    if (!isExpired) {
      return serviceState.tokens.accessToken;
    }

    // Token expiré, essayer de rafraîchir
    if (isExpired && serviceState.tokens?.refreshToken) {
      try {
        await refreshToken(service);
        return authState[service].tokens?.accessToken || null;
      } catch (error) {
        Logger.error(CONTEXT, `Failed to refresh ${service} token`, error);
        return null;
      }
    }

    return null;
  };

  /**
   * Efface tous les tokens
   */
  const clearAllTokens = async () => {
    try {
      await SecureStorage.deleteTokens('spotify');
      // Add soundcloud when implemented
      // await SecureStorage.deleteTokens('soundcloud');
      setAuthState(initialAuthState);
      Logger.info(CONTEXT, 'All tokens cleared');
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to clear all tokens', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    authState,
    isRestoring, // Exposer l'état de restauration
    loginSpotify,
    logoutSpotify,
    refreshSpotifyToken,
    logout,
    refreshToken,
    isAuthenticated,
    getAccessToken,
    clearAllTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
