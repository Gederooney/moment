/**
 * Contrôleur de lecture SoundCloud avec expo-av
 * Support du streaming HLS
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Logger } from '../../logger/Logger';
import { MusicServiceError, PlaybackState, MusicTrack } from '../common/types';
import { SoundCloudAPI } from './SoundCloudAPI';

const CONTEXT = 'SoundCloudPlayer';

export class SoundCloudPlayer {
  private static sound: Audio.Sound | null = null;
  private static currentTrack: MusicTrack | null = null;

  /**
   * Initialise l'audio pour la lecture
   */
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      Logger.info(CONTEXT, 'Audio mode configured');
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to initialize audio', error);
      throw error;
    }
  }

  /**
   * Lance la lecture d'un track
   */
  static async play(
    track: MusicTrack,
    positionMs = 0
  ): Promise<void> {
    try {
      // Arrêter la lecture précédente
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Récupérer l'URL de streaming
      const streamUrl = await SoundCloudAPI.getStreamUrl(
        parseInt(track.id, 10)
      );

      // Charger et jouer
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true, positionMillis: positionMs },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentTrack = track;

      Logger.info(CONTEXT, 'Playback started', {
        trackId: track.id,
        positionMs,
      });
    } catch (error) {
      Logger.error(CONTEXT, 'Play failed', error);
      throw new MusicServiceError(
        'Failed to play track',
        'PLAYBACK_FAILED',
        'soundcloud',
        error
      );
    }
  }

  /**
   * Met en pause la lecture
   */
  static async pause(): Promise<void> {
    try {
      if (!this.sound) {
        Logger.warn(CONTEXT, 'No sound to pause');
        return;
      }

      await this.sound.pauseAsync();
      Logger.info(CONTEXT, 'Playback paused');
    } catch (error) {
      Logger.error(CONTEXT, 'Pause failed', error);
      throw error;
    }
  }

  /**
   * Reprend la lecture
   */
  static async resume(): Promise<void> {
    try {
      if (!this.sound) {
        Logger.warn(CONTEXT, 'No sound to resume');
        return;
      }

      await this.sound.playAsync();
      Logger.info(CONTEXT, 'Playback resumed');
    } catch (error) {
      Logger.error(CONTEXT, 'Resume failed', error);
      throw error;
    }
  }

  /**
   * Se déplace dans la lecture
   */
  static async seek(positionMs: number): Promise<void> {
    try {
      if (!this.sound) {
        throw new MusicServiceError(
          'No sound loaded',
          'NO_SOUND',
          'soundcloud'
        );
      }

      await this.sound.setPositionAsync(positionMs);
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
      if (!this.sound || !this.currentTrack) {
        return {
          isPlaying: false,
          position: 0,
          track: null,
        };
      }

      const status = await this.sound.getStatusAsync();

      if (!status.isLoaded) {
        return {
          isPlaying: false,
          position: 0,
          track: null,
        };
      }

      return {
        isPlaying: status.isPlaying,
        position: status.positionMillis,
        track: this.currentTrack,
      };
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to get current track', error);
      throw error;
    }
  }

  /**
   * Arrête et libère les ressources
   */
  static async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentTrack = null;
        Logger.info(CONTEXT, 'Playback stopped');
      }
    } catch (error) {
      Logger.error(CONTEXT, 'Stop failed', error);
      throw error;
    }
  }

  /**
   * Callback pour les mises à jour de statut
   */
  private static onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        Logger.error(CONTEXT, 'Playback error', status.error);
      }
      return;
    }

    if (status.didJustFinish) {
      Logger.info(CONTEXT, 'Track finished');
      // Possibilité d'émettre un événement pour passer au suivant
    }
  };
}
