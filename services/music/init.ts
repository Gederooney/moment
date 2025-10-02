/**
 * Initialisation des services musicaux
 * À appeler au démarrage de l'app (app/_layout.tsx)
 */

import { SpotifyAuth } from './spotify/SpotifyAuth';
import { SpotifyAPI } from './spotify/SpotifyAPI';
import { SoundCloudAuth } from './soundcloud/SoundCloudAuth';
import { SoundCloudAPI } from './soundcloud/SoundCloudAPI';
import { SoundCloudPlayer } from './soundcloud/SoundCloudPlayer';
import { Logger } from '../logger/Logger';

const CONTEXT = 'MusicServicesInit';

interface MusicServicesConfig {
  spotify?: {
    clientId: string;
    redirectUri?: string;
  };
  soundcloud?: {
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
  };
}

/**
 * Initialise tous les services musicaux
 */
export async function initializeMusicServices(
  config: MusicServicesConfig
): Promise<void> {
  try {
    Logger.info(CONTEXT, 'Initializing music services');

    // Spotify
    if (config.spotify?.clientId) {
      SpotifyAuth.configure(
        config.spotify.clientId,
        config.spotify.redirectUri
      );
      SpotifyAPI.initialize();
      Logger.info(CONTEXT, 'Spotify initialized');
    } else {
      Logger.warn(CONTEXT, 'Spotify not configured (missing clientId)');
    }

    // SoundCloud
    if (config.soundcloud?.clientId) {
      SoundCloudAuth.configure(
        config.soundcloud.clientId,
        config.soundcloud.clientSecret,
        config.soundcloud.redirectUri
      );
      SoundCloudAPI.initialize(config.soundcloud.clientId);
      await SoundCloudPlayer.initialize();
      Logger.info(CONTEXT, 'SoundCloud initialized');
    } else {
      Logger.warn(CONTEXT, 'SoundCloud not configured (missing clientId)');
    }

    Logger.info(CONTEXT, 'Music services initialization complete');
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to initialize music services', error);
    throw error;
  }
}

/**
 * Helper pour charger la config depuis les variables d'environnement
 */
export function getMusicServicesConfigFromEnv(): MusicServicesConfig {
  return {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      redirectUri:
        process.env.SPOTIFY_REDIRECT_URI || 'podcut://callback',
    },
    soundcloud: {
      clientId: process.env.SOUNDCLOUD_CLIENT_ID || '',
      clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
      redirectUri:
        process.env.SOUNDCLOUD_REDIRECT_URI || 'podcut://callback',
    },
  };
}
