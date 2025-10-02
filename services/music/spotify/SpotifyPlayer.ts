/**
 * Contrôleur de lecture Spotify
 * Nécessite un compte Spotify Premium
 */

import axios from 'axios';
import { Logger } from '../../logger/Logger';
import { SecureStorage } from '../common/SecureStorage';
import { MusicServiceError, PlaybackState } from '../common/types';
import { SpotifyAPI } from './SpotifyAPI';
import { SpotifyPlaybackState, SpotifyDevice } from './types';

const CONTEXT = 'SpotifyPlayer';
const BASE_URL = 'https://api.spotify.com/v1';

export class SpotifyPlayer {
  /**
   * Lance la lecture d'un track
   */
  static async play(trackUri: string, positionMs = 0): Promise<void> {
    try {
      const tokens = await SecureStorage.getTokens('spotify');
      if (!tokens) {
        throw new MusicServiceError(
          'Not authenticated',
          'NOT_AUTHENTICATED',
          'spotify'
        );
      }

      // Vérifier qu'un device est disponible
      const devices = await this.getDevices(tokens.accessToken);
      if (devices.length === 0) {
        throw new MusicServiceError(
          'No active device found. Open Spotify on your device first.',
          'NO_DEVICE',
          'spotify'
        );
      }

      await axios.put(
        `${BASE_URL}/me/player/play`,
        {
          uris: [trackUri],
          position_ms: positionMs,
        },
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );

      Logger.info(CONTEXT, 'Playback started', { trackUri, positionMs });
    } catch (error: any) {
      if (error.response?.status === 403) {
        Logger.error(CONTEXT, 'Premium required for playback');
        throw new MusicServiceError(
          'Spotify Premium required for playback control',
          'PREMIUM_REQUIRED',
          'spotify',
          error
        );
      }
      Logger.error(CONTEXT, 'Play failed', error);
      throw error;
    }
  }

  /**
   * Met en pause la lecture
   */
  static async pause(): Promise<void> {
    try {
      const tokens = await SecureStorage.getTokens('spotify');
      if (!tokens) {
        throw new MusicServiceError(
          'Not authenticated',
          'NOT_AUTHENTICATED',
          'spotify'
        );
      }

      await axios.put(
        `${BASE_URL}/me/player/pause`,
        {},
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );

      Logger.info(CONTEXT, 'Playback paused');
    } catch (error) {
      Logger.error(CONTEXT, 'Pause failed', error);
      throw error;
    }
  }

  /**
   * Se déplace dans la lecture
   */
  static async seek(positionMs: number): Promise<void> {
    try {
      const tokens = await SecureStorage.getTokens('spotify');
      if (!tokens) {
        throw new MusicServiceError(
          'Not authenticated',
          'NOT_AUTHENTICATED',
          'spotify'
        );
      }

      await axios.put(
        `${BASE_URL}/me/player/seek`,
        null,
        {
          params: { position_ms: positionMs },
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );

      Logger.info(CONTEXT, 'Seek completed', { positionMs });
    } catch (error) {
      Logger.error(CONTEXT, 'Seek failed', error);
      throw error;
    }
  }

  /**
   * Récupère l'état de lecture actuel
   */
  static async getCurrentTrack(): Promise<PlaybackState> {
    try {
      const tokens = await SecureStorage.getTokens('spotify');
      if (!tokens) {
        throw new MusicServiceError(
          'Not authenticated',
          'NOT_AUTHENTICATED',
          'spotify'
        );
      }

      const response = await axios.get<SpotifyPlaybackState>(
        `${BASE_URL}/me/player`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );

      if (!response.data || !response.data.item) {
        return {
          isPlaying: false,
          position: 0,
          track: null,
        };
      }

      return {
        isPlaying: response.data.is_playing,
        position: response.data.progress_ms,
        track: response.data.item
          ? {
              id: response.data.item.id,
              title: response.data.item.name,
              artist: response.data.item.artists.map((a) => a.name).join(', '),
              duration: response.data.item.duration_ms,
              albumArt: response.data.item.album.images[0]?.url,
              uri: response.data.item.uri,
              source: 'spotify',
            }
          : null,
      };
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get current track', error);
      throw error;
    }
  }

  /**
   * Récupère les devices disponibles
   */
  private static async getDevices(accessToken: string): Promise<SpotifyDevice[]> {
    try {
      const response = await axios.get<{ devices: SpotifyDevice[] }>(
        `${BASE_URL}/me/player/devices`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data.devices;
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get devices', error);
      return [];
    }
  }
}
