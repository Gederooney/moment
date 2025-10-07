/**
 * Configuration OAuth centralisée pour Spotify et SoundCloud
 *
 * IMPORTANT: Ne jamais committer les vraies credentials dans le code.
 * Utiliser des variables d'environnement (.env)
 */

import { makeRedirectUri } from 'expo-auth-session';
import { OAuthConfig } from '../types/auth.types';

/**
 * Scopes Spotify - Changements 2025
 * Depuis avril 2025: OAuth PKCE obligatoire avec Universal Linking
 */
const SPOTIFY_SCOPES = [
  'user-read-private',          // Profil utilisateur
  'user-read-email',            // Email utilisateur
  'streaming',                  // Contrôle de lecture
  'user-modify-playback-state', // Modification de lecture
  'user-read-playback-state',   // État de lecture
  'user-library-read',          // Bibliothèque utilisateur
  'user-library-modify',        // Modification bibliothèque
  'playlist-read-private',      // Playlists privées
  'playlist-modify-public',     // Modification playlists publiques
  'playlist-modify-private',    // Modification playlists privées
  'user-read-currently-playing',// Lecture en cours
];

/**
 * Scopes SoundCloud - OAuth 2.1
 * Depuis novembre 2025: Migration vers AAC HLS obligatoire
 */
const SOUNDCLOUD_SCOPES = [
  'non-expiring', // Token longue durée
];

/**
 * Endpoints OAuth Spotify
 * Changement avril 2025: HTTPS uniquement pour redirectUri
 */
const SPOTIFY_ENDPOINTS = {
  authorization: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
};

/**
 * Endpoints OAuth SoundCloud
 * OAuth 2.1 avec PKCE obligatoire depuis octobre 2024
 */
const SOUNDCLOUD_ENDPOINTS = {
  authorization: 'https://secure.soundcloud.com/connect',
  token: 'https://api.soundcloud.com/oauth2/token',
};

/**
 * Génère l'URI de redirection
 * Utilise expo-auth-session pour compatibilité cross-platform
 * En développement avec ngrok, utilise l'URL fournie dans .env
 */
const getRedirectUri = (): string => {
  // Si EXPO_PUBLIC_REDIRECT_URI est défini (ngrok), l'utiliser
  if (process.env.EXPO_PUBLIC_REDIRECT_URI) {
    return process.env.EXPO_PUBLIC_REDIRECT_URI;
  }

  // Sinon, utiliser le scheme natif
  return makeRedirectUri({
    scheme: 'podcut',
    path: 'callback',
  });
};

/**
 * Récupère les credentials depuis les variables d'environnement
 *
 * SETUP REQUIS:
 * 1. Créer un fichier .env à la racine du projet
 * 2. Ajouter les variables:
 *    - EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
 *    - EXPO_PUBLIC_SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
 *    - EXPO_PUBLIC_SOUNDCLOUD_CLIENT_SECRET=your_soundcloud_secret (optionnel)
 */
const getClientId = (service: 'spotify' | 'soundcloud'): string => {
  const clientId = service === 'spotify'
    ? process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID
    : process.env.EXPO_PUBLIC_SOUNDCLOUD_CLIENT_ID;

  if (!clientId || clientId === '' || clientId.includes('placeholder')) {
    console.warn(`⚠️ ${service.toUpperCase()}_CLIENT_ID not set. Using placeholder.`);
    return `${service}_client_id_placeholder`;
  }

  return clientId;
};

/**
 * Récupère le client secret SoundCloud (optionnel pour PKCE)
 */
const getSoundCloudSecret = (): string | undefined => {
  return process.env.EXPO_PUBLIC_SOUNDCLOUD_CLIENT_SECRET;
};

/**
 * Configuration OAuth complète
 *
 * NOTES:
 * - Spotify: OAuth 2.0 PKCE avec Universal Linking (obligatoire depuis avril 2025)
 * - SoundCloud: OAuth 2.1 PKCE (obligatoire depuis octobre 2024)
 * - Redirect URI: Utilise expo-auth-session pour cross-platform
 * - Client Secret: Optionnel pour PKCE, mais recommandé pour SoundCloud
 */
export const oauthConfig: OAuthConfig = {
  spotify: {
    clientId: getClientId('spotify'),
    redirectUri: getRedirectUri(),
    scopes: SPOTIFY_SCOPES,
    authorizationEndpoint: SPOTIFY_ENDPOINTS.authorization,
    tokenEndpoint: SPOTIFY_ENDPOINTS.token,
  },
  soundcloud: {
    clientId: getClientId('soundcloud'),
    clientSecret: getSoundCloudSecret(),
    redirectUri: getRedirectUri(),
    scopes: SOUNDCLOUD_SCOPES,
    authorizationEndpoint: SOUNDCLOUD_ENDPOINTS.authorization,
    tokenEndpoint: SOUNDCLOUD_ENDPOINTS.token,
  },
};

/**
 * Valide la configuration OAuth
 * Vérifie que les credentials sont présents
 */
export const validateOAuthConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (oauthConfig.spotify.clientId.includes('placeholder')) {
    errors.push('Spotify Client ID not configured');
  }

  if (oauthConfig.soundcloud.clientId.includes('placeholder')) {
    errors.push('SoundCloud Client ID not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Configuration du refresh automatique
 * Buffer de 5 minutes avant expiration
 */
export const AUTO_REFRESH_CONFIG = {
  enabled: true,
  bufferTime: 5 * 60 * 1000, // 5 minutes en millisecondes
  maxRetries: 3,
  retryDelay: 2000, // 2 secondes
};

/**
 * Limites de taux (Rate Limits) - Documentés
 */
export const RATE_LIMITS = {
  spotify: {
    requestsPerMinute: 180, // Non officiel, estimation conservative
    developmentUsers: 25,   // Mode dev: max 25 utilisateurs
  },
  soundcloud: {
    tokensPerTwelveHours: 50, // Client Credentials Flow
    tokensPerHour: 30,        // Par IP
  },
};

/**
 * URLs de documentation
 */
export const DOCUMENTATION_URLS = {
  spotify: {
    oauth: 'https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow',
    api: 'https://developer.spotify.com/documentation/web-api',
  },
  soundcloud: {
    oauth: 'https://developers.soundcloud.com/docs/api/guide',
    api: 'https://developers.soundcloud.com/docs/api/reference',
  },
};

/**
 * Export des configurations individuelles pour usage direct
 */
export const spotifyConfig = oauthConfig.spotify;
export const soundcloudConfig = oauthConfig.soundcloud;
