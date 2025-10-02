/**
 * Client API SoundCloud avec auto-refresh des tokens
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Logger } from '../../logger/Logger';
import { SecureStorage } from '../common/SecureStorage';
import { MusicServiceError, MusicTrack, SearchResult } from '../common/types';
import { SoundCloudAuth } from './SoundCloudAuth';
import {
  SoundCloudTrack,
  SoundCloudSearchResponse,
  SoundCloudStreamInfo,
  SoundCloudError,
} from './types';

const CONTEXT = 'SoundCloudAPI';
const BASE_URL = 'https://api.soundcloud.com';

export class SoundCloudAPI {
  private static client: AxiosInstance;
  private static clientId: string;

  /**
   * Initialise le client HTTP avec intercepteurs
   */
  static initialize(clientId: string) {
    this.clientId = clientId;
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use(async (config) => {
      const tokens = await SecureStorage.getTokens('soundcloud');

      if (!tokens) {
        // Utiliser client_id public pour les requêtes non authentifiées
        config.params = { ...config.params, client_id: this.clientId };
        return config;
      }

      // Refresh si expiré
      if (SecureStorage.isTokenExpired(tokens)) {
        if (!tokens.refreshToken) {
          throw new MusicServiceError(
            'No refresh token',
            'NO_REFRESH_TOKEN',
            'soundcloud'
          );
        }
        const newTokens = await SoundCloudAuth.refreshToken(
          tokens.refreshToken
        );
        config.headers.Authorization = `OAuth ${newTokens.accessToken}`;
      } else {
        config.headers.Authorization = `OAuth ${tokens.accessToken}`;
      }

      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<SoundCloudError>) => {
        if (error.response?.status === 429) {
          Logger.warn(CONTEXT, 'Rate limited');
          throw new MusicServiceError(
            'Rate limit exceeded',
            'RATE_LIMIT',
            'soundcloud'
          );
        }

        if (error.response?.status === 401) {
          Logger.error(CONTEXT, 'Unauthorized - clearing tokens');
          await SecureStorage.deleteTokens('soundcloud');
          throw new MusicServiceError(
            'Unauthorized',
            'UNAUTHORIZED',
            'soundcloud'
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
      const response = await this.client.get<SoundCloudSearchResponse>(
        '/tracks',
        {
          params: {
            q: query,
            limit,
          },
        }
      );

      return {
        tracks: response.data.collection.map(this.mapTrack),
        total: response.data.total_results,
      };
    } catch (error) {
      Logger.error(CONTEXT, 'Search failed', error);
      throw error;
    }
  }

  /**
   * Récupère un track par ID
   */
  static async getTrack(id: number): Promise<MusicTrack> {
    try {
      const response = await this.client.get<SoundCloudTrack>(`/tracks/${id}`);
      return this.mapTrack(response.data);
    } catch (error) {
      Logger.error(CONTEXT, `Failed to get track ${id}`, error);
      throw error;
    }
  }

  /**
   * Récupère l'URL de streaming HLS
   */
  static async getStreamUrl(trackId: number): Promise<string> {
    try {
      const tokens = await SecureStorage.getTokens('soundcloud');

      if (!tokens) {
        throw new MusicServiceError(
          'Authentication required for streaming',
          'NOT_AUTHENTICATED',
          'soundcloud'
        );
      }

      const response = await this.client.get<SoundCloudStreamInfo>(
        `/tracks/${trackId}/streams`,
        {
          headers: { Authorization: `OAuth ${tokens.accessToken}` },
        }
      );

      Logger.info(CONTEXT, `Stream URL retrieved for track ${trackId}`);
      return response.data.url;
    } catch (error) {
      Logger.error(CONTEXT, `Failed to get stream URL for ${trackId}`, error);
      throw error;
    }
  }

  /**
   * Convertit un SoundCloudTrack en MusicTrack
   */
  private static mapTrack(track: SoundCloudTrack): MusicTrack {
    // SoundCloud artwork URLs peuvent être en basse résolution par défaut
    const albumArt = track.artwork_url
      ? track.artwork_url.replace('-large', '-t500x500')
      : track.user.avatar_url;

    return {
      id: track.id.toString(),
      title: track.title,
      artist: track.user.username,
      duration: track.duration,
      albumArt,
      uri: track.stream_url,
      source: 'soundcloud',
    };
  }
}
