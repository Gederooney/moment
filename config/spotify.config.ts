/**
 * Configuration Spotify pour PodCut
 * Centralize toutes les configurations Spotify
 */

import { SpotifyAuthConfig } from '../services/audio/spotify/types';

// NOTE: En production, utilisez react-native-config ou expo-constants
// pour charger ces valeurs depuis .env
export const SPOTIFY_CONFIG: SpotifyAuthConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID || '',
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'podcut://callback',
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming',
  ],
};

// Validation de la configuration
export const validateSpotifyConfig = (): boolean => {
  if (!SPOTIFY_CONFIG.clientId) {
    console.error('SPOTIFY_CLIENT_ID manquant dans .env');
    return false;
  }
  if (!SPOTIFY_CONFIG.redirectUri) {
    console.error('SPOTIFY_REDIRECT_URI manquant dans .env');
    return false;
  }
  return true;
};
