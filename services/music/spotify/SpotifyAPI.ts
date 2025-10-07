/**
 * Client API Spotify avec auto-refresh des tokens
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Logger } from '../../logger/Logger';
import { SecureStorage } from '../common/SecureStorage';
import { MusicServiceError, MusicTrack, SearchResult } from '../common/types';
import { SpotifyAuth } from './SpotifyAuth';
import {
  SpotifyTrack,
  SpotifySearchResponse,
  SpotifyUser,
  SpotifyError,
} from './types';

const CONTEXT = 'SpotifyAPI';
const BASE_URL = 'https://api.spotify.com/v1';

export class SpotifyAPI {
  private static client: AxiosInstance;
  private static initialized = false;

  /**
   * Check if API is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialise le client HTTP avec intercepteurs
   */
  static initialize() {
    this.initialized = true;
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use(async (config) => {
      const tokens = await SecureStorage.getTokens('spotify');

      if (!tokens) {
        throw new MusicServiceError(
          'Not authenticated',
          'NOT_AUTHENTICATED',
          'spotify'
        );
      }

      // Refresh si expiré
      if (SecureStorage.isTokenExpired(tokens)) {
        if (!tokens.refreshToken) {
          throw new MusicServiceError(
            'No refresh token',
            'NO_REFRESH_TOKEN',
            'spotify'
          );
        }
        const newTokens = await SpotifyAuth.refreshToken(tokens.refreshToken);
        config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      } else {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<SpotifyError>) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          Logger.warn(CONTEXT, `Rate limited, retry after ${retryAfter}s`);
          throw new MusicServiceError(
            'Rate limit exceeded',
            'RATE_LIMIT',
            'spotify',
            { retryAfter }
          );
        }

        if (error.response?.status === 401) {
          Logger.error(CONTEXT, 'Unauthorized - refreshing token');
          const tokens = await SecureStorage.getTokens('spotify');
          if (tokens?.refreshToken) {
            try {
              const newTokens = await SpotifyAuth.refreshToken(tokens.refreshToken);
              await SecureStorage.saveTokens('spotify', newTokens);
              // Retry the original request with new token
              error.config!.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client.request(error.config!);
            } catch (refreshError) {
              Logger.error(CONTEXT, 'Token refresh failed - clearing tokens');
              await SecureStorage.deleteTokens('spotify');
              throw new MusicServiceError(
                'Authentication failed',
                'AUTH_FAILED',
                'spotify'
              );
            }
          } else {
            await SecureStorage.deleteTokens('spotify');
            throw new MusicServiceError(
              'Unauthorized',
              'UNAUTHORIZED',
              'spotify'
            );
          }
        }

        if (error.response?.status === 403) {
          Logger.warn(CONTEXT, 'Forbidden - endpoint restricted for new apps');
          // Don't delete tokens - just return error for this specific request
          throw new MusicServiceError(
            'Endpoint restricted',
            'FORBIDDEN',
            'spotify'
          );
        }

        throw error;
      }
    );

    Logger.info(CONTEXT, 'Client initialized');
  }

  /**
   * Recherche des tracks
   */
  static async searchTracks(query: string, limit = 20): Promise<SearchResult> {
    try {
      const response = await this.client.get<SpotifySearchResponse>('/search', {
        params: {
          q: query,
          type: 'track',
          limit,
        },
      });

      return {
        tracks: response.data.tracks.items.map(this.mapTrack),
        total: response.data.tracks.total,
      };
    } catch (error) {
      Logger.error(CONTEXT, 'Search failed', error);
      throw error;
    }
  }

  /**
   * Récupère un track par ID
   */
  static async getTrack(id: string): Promise<MusicTrack> {
    try {
      const response = await this.client.get<SpotifyTrack>(`/tracks/${id}`);
      return this.mapTrack(response.data);
    } catch (error) {
      Logger.error(CONTEXT, `Failed to get track ${id}`, error);
      throw error;
    }
  }

  /**
   * Récupère le profil utilisateur
   */
  static async getUserProfile(): Promise<SpotifyUser> {
    try {
      const response = await this.client.get<SpotifyUser>('/me');
      Logger.info(CONTEXT, 'User profile retrieved', {
        id: response.data.id,
        product: response.data.product,
      });
      return response.data;
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get user profile', error);
      throw error;
    }
  }

  /**
   * Récupère les playlists de l'utilisateur
   */
  static async getUserPlaylists(limit: number = 50, offset: number = 0): Promise<any> {
    try {
      const response = await this.client.get('/me/playlists', {
        params: { limit, offset },
      });
      Logger.info(CONTEXT, 'Playlists retrieved', {
        count: response.data.items?.length,
        total: response.data.total,
      });
      return response.data;
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get playlists', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les tracks d'une playlist
   */
  static async getPlaylistTracks(playlistId: string, limit: number = 50, offset: number = 0): Promise<any> {
    try {
      const response = await this.client.get(`/playlists/${playlistId}/tracks`, {
        params: { limit, offset },
      });
      Logger.info(CONTEXT, 'Playlist tracks retrieved', {
        playlistId,
        count: response.data.items?.length,
        total: response.data.total,
      });
      return response.data;
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get playlist tracks', error);
      throw this.handleError(error);
    }
  }

  /**
   * Convertit un SpotifyTrack en MusicTrack
   */
  private static mapTrack(track: SpotifyTrack): MusicTrack {
    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      duration: track.duration_ms,
      albumArt: track.album.images[0]?.url,
      uri: track.uri,
      source: 'spotify',
    };
  }

  /**
   * Gère les erreurs Spotify
   */
  private static handleError(error: any): MusicServiceError {
    if (error.response?.status === 401) {
      return new MusicServiceError(
        'Not authenticated',
        'NOT_AUTHENTICATED',
        'spotify'
      );
    }
    if (error.response?.status === 429) {
      return new MusicServiceError(
        'Rate limited',
        'RATE_LIMITED',
        'spotify'
      );
    }
    return new MusicServiceError(
      error.message || 'Unknown error',
      'UNKNOWN',
      'spotify',
      error
    );
  }
}
