/**
 * Service de contrôle de lecture Spotify
 * Gère la lecture, pause, et état de lecture via l'API Spotify Web
 */

import axios, { AxiosInstance } from 'axios';
import { Logger } from '../../logger/Logger';
import { SpotifyAuth } from './SpotifyAuth';
import { SpotifyAPI } from './SpotifyAPI';
import {
  SpotifyTrack,
  SpotifyPlaybackState,
  SpotifyDevice,
} from './types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyPlayer {
  private static instance: SpotifyPlayer;
  private axiosInstance: AxiosInstance;
  private auth: SpotifyAuth;
  private api: SpotifyAPI;

  private constructor(auth: SpotifyAuth, api: SpotifyAPI) {
    this.auth = auth;
    this.api = api;
    this.axiosInstance = axios.create({
      baseURL: SPOTIFY_API_BASE,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  static getInstance(auth: SpotifyAuth, api: SpotifyAPI): SpotifyPlayer {
    if (!SpotifyPlayer.instance) {
      SpotifyPlayer.instance = new SpotifyPlayer(auth, api);
    }
    return SpotifyPlayer.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.auth.getValidAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        Logger.error('SpotifyPlayer.requestInterceptor', error);
        return Promise.reject(error);
      }
    );
  }

  async play(trackUri: string, deviceId?: string): Promise<void> {
    try {
      const isPremium = await this.api.checkPremiumStatus();
      if (!isPremium) {
        throw new Error('Spotify Premium required for playback');
      }

      const params = deviceId ? { device_id: deviceId } : {};
      await this.axiosInstance.put('/me/player/play',
        { uris: [trackUri] },
        { params }
      );
      Logger.info('SpotifyPlayer.play', `Playing: ${trackUri}`);
    } catch (error) {
      Logger.error('SpotifyPlayer.play', error as Error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      await this.axiosInstance.put('/me/player/pause');
      Logger.info('SpotifyPlayer.pause', 'Playback paused');
    } catch (error) {
      Logger.error('SpotifyPlayer.pause', error as Error);
      throw error;
    }
  }

  async resume(): Promise<void> {
    try {
      await this.axiosInstance.put('/me/player/play');
      Logger.info('SpotifyPlayer.resume', 'Playback resumed');
    } catch (error) {
      Logger.error('SpotifyPlayer.resume', error as Error);
      throw error;
    }
  }

  async getCurrentTrack(): Promise<SpotifyTrack | null> {
    try {
      const state = await this.getPlaybackState();
      return state?.item || null;
    } catch (error) {
      Logger.error('SpotifyPlayer.getCurrentTrack', error as Error);
      return null;
    }
  }

  async getPlaybackState(): Promise<SpotifyPlaybackState | null> {
    try {
      const response = await this.axiosInstance.get<SpotifyPlaybackState>(
        '/me/player'
      );
      Logger.debug('SpotifyPlayer.getPlaybackState', 'State retrieved');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 204) {
        Logger.info('SpotifyPlayer.getPlaybackState', 'No active playback');
        return null;
      }
      Logger.error('SpotifyPlayer.getPlaybackState', error as Error);
      return null;
    }
  }

  async getAvailableDevices(): Promise<SpotifyDevice[]> {
    try {
      const response = await this.axiosInstance.get<{ devices: SpotifyDevice[] }>(
        '/me/player/devices'
      );
      Logger.info('SpotifyPlayer.getAvailableDevices',
        `Found ${response.data.devices.length} devices`
      );
      return response.data.devices;
    } catch (error) {
      Logger.error('SpotifyPlayer.getAvailableDevices', error as Error);
      return [];
    }
  }

  async transferPlayback(deviceId: string, play = true): Promise<void> {
    try {
      await this.axiosInstance.put('/me/player', {
        device_ids: [deviceId],
        play,
      });
      Logger.info('SpotifyPlayer.transferPlayback', `Transferred to: ${deviceId}`);
    } catch (error) {
      Logger.error('SpotifyPlayer.transferPlayback', error as Error);
      throw error;
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    return this.api.checkPremiumStatus();
  }
}
