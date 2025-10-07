/**
 * Configuration d'environnement pour l'application Moments
 *
 * Utilise expo-constants pour charger les variables d'environnement
 * Permet de basculer entre dev/staging/production
 */

import Constants from 'expo-constants';

const ENV = {
  dev: {
    // Backend API
    API_URL: 'http://localhost:3001',

    // OAuth Redirect URLs
    SPOTIFY_REDIRECT_URI: 'podcut://callback',
    SOUNDCLOUD_REDIRECT_URI: 'podcut://callback',

    // Pour le développement local avec Expo Go
    EXPO_REDIRECT_URI: 'exp://localhost:8081',
  },
  staging: {
    API_URL: 'https://staging-api.moments-app.com',
    SPOTIFY_REDIRECT_URI: 'podcut://callback',
    SOUNDCLOUD_REDIRECT_URI: 'podcut://callback',
    EXPO_REDIRECT_URI: 'podcut://callback',
  },
  production: {
    API_URL: 'https://api.moments-app.com',
    SPOTIFY_REDIRECT_URI: 'podcut://callback',
    SOUNDCLOUD_REDIRECT_URI: 'podcut://callback',
    EXPO_REDIRECT_URI: 'podcut://callback',
  }
};

/**
 * Détermine l'environnement actuel
 * En dev: utilise le channel 'development'
 * En production: utilise le channel 'production' ou default
 */
const getEnvVars = (env = Constants.expoConfig?.extra?.env) => {
  // Permet de forcer un environnement via extra.env dans app.json
  if (env === 'production') return ENV.production;
  if (env === 'staging') return ENV.staging;
  if (env === 'dev') return ENV.dev;

  // Détection automatique basée sur le release channel
  if (__DEV__) {
    return ENV.dev;
  }

  // Default to production for safety
  return ENV.production;
};

export default getEnvVars();