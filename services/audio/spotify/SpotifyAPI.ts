/**
 * Service API Spotify pour recherche et métadonnées
 * Gère les appels à l'API Web Spotify
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Logger } from '../../logger/Logger';
import { SpotifyAuth } from './SpotifyAuth';
import {
  SpotifyTrack,
  SpotifySearchResult,
  SpotifyUserProfile,
  SpotifyError,
} from './types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyAPI {
  private static instance: SpotifyAPI;
  private axiosInstance: AxiosInstance;
  private auth: SpotifyAuth;

  private constructor(auth: SpotifyAuth) {
    this.auth = auth;
    this.axiosInstance = axios.create({
      baseURL: SPOTIFY_API_BASE,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  static getInstance(auth: SpotifyAuth): SpotifyAPI {
    if (!SpotifyAPI.instance) {
      SpotifyAPI.instance = new SpotifyAPI(auth);
    }
    return SpotifyAPI.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.auth.getValidAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        Logger.error('SpotifyAPI.requestInterceptor', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<SpotifyError>) => {
        if (error.response?.status === 401) {
          Logger.warn('SpotifyAPI.responseInterceptor', 'Token expired, refreshing');
          try {
            await this.auth.refreshAccessToken();
            return this.axiosInstance.request(error.config!);
          } catch (refreshError) {
            Logger.error('SpotifyAPI.responseInterceptor', refreshError as Error);
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async search(query: string, limit = 20): Promise<SpotifyTrack[]> {
    try {
      Logger.info('SpotifyAPI.search', `Searching: ${query}`);
      const response = await this.axiosInstance.get<SpotifySearchResult>('/search', {
        params: {
          q: query,
          type: 'track',
          limit,
        },
      });
      return response.data.tracks.items;
    } catch (error) {
      Logger.error('SpotifyAPI.search', error as Error);
      throw error;
    }
  }

  async getTrackMetadata(trackId: string): Promise<SpotifyTrack> {
    try {
      Logger.info('SpotifyAPI.getTrackMetadata', `Fetching track: ${trackId}`);
      const response = await this.axiosInstance.get<SpotifyTrack>(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      Logger.error('SpotifyAPI.getTrackMetadata', error as Error);
      throw error;
    }
  }

  async getUserProfile(): Promise<SpotifyUserProfile> {
    try {
      Logger.info('SpotifyAPI.getUserProfile', 'Fetching user profile');
      const response = await this.axiosInstance.get<SpotifyUserProfile>('/me');
      return response.data;
    } catch (error) {
      Logger.error('SpotifyAPI.getUserProfile', error as Error);
      throw error;
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      const isPremium = profile.product === 'premium';
      Logger.info('SpotifyAPI.checkPremiumStatus', `Premium: ${isPremium}`);
      return isPremium;
    } catch (error) {
      Logger.error('SpotifyAPI.checkPremiumStatus', error as Error);
      return false;
    }
  }

  async getRecommendations(
    seedTracks: string[],
    limit = 10
  ): Promise<SpotifyTrack[]> {
    try {
      Logger.info('SpotifyAPI.getRecommendations', `Seeds: ${seedTracks.length}`);
      const response = await this.axiosInstance.get<{ tracks: SpotifyTrack[] }>(
        '/recommendations',
        {
          params: {
            seed_tracks: seedTracks.slice(0, 5).join(','),
            limit,
          },
        }
      );
      return response.data.tracks;
    } catch (error) {
      Logger.error('SpotifyAPI.getRecommendations', error as Error);
      throw error;
    }
  }
}
