/**
 * Utilitaires de stockage sécurisé des tokens OAuth
 *
 * Fonctionnalités:
 * - Stockage chiffré avec expo-secure-store (hardware-backed)
 * - Fallback vers AsyncStorage si SecureStore indisponible
 * - Métadonnées de tokens (création, expiration, refresh count)
 * - Validation et vérification d'expiration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  AuthToken,
  MusicService,
  StoredToken,
  TokenMetadata,
  TokenValidationResult,
} from '../types/auth.types';

/**
 * Préfixe pour les clés de stockage
 * Note: Pas de '@' car SecureStore n'accepte que alphanumériques, ".", "-", "_"
 */
const STORAGE_KEY_PREFIX = 'podcut_auth';

/**
 * Buffer de temps avant expiration pour considérer un token comme "à rafraîchir"
 * 5 minutes par défaut
 */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Vérifie si SecureStore est disponible
 * SecureStore n'est pas disponible sur tous les simulateurs
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    await SecureStore.setItemAsync('__test__', 'test');
    await SecureStore.deleteItemAsync('__test__');
    return true;
  } catch {
    return false;
  }
};

/**
 * Génère la clé de stockage pour un service
 */
const getStorageKey = (service: MusicService): string => {
  if (!service || service !== MusicService.SPOTIFY) {
    throw new Error(`Invalid service provided to getStorageKey: ${service}. Only Spotify is supported.`);
  }
  return `${STORAGE_KEY_PREFIX}_${service}_token`;
};

/**
 * Sauvegarde un token de manière sécurisée
 *
 * @param service - Service musical (spotify ou soundcloud)
 * @param token - Token à sauvegarder
 * @returns Promise<void>
 */
export const saveToken = async (
  service: MusicService,
  token: AuthToken
): Promise<void> => {
  try {
    // Valider le service avant de continuer
    if (!service || service !== MusicService.SPOTIFY) {
      throw new Error(`Invalid service: ${service}. Only Spotify is supported.`);
    }

    const metadata: TokenMetadata = {
      createdAt: Date.now(),
      expiresAt: token.expiresAt,
      refreshCount: 0,
    };

    const storedToken: StoredToken = {
      ...token,
      metadata,
    };

    const key = getStorageKey(service);
    const value = JSON.stringify(storedToken);

    // Essayer SecureStore d'abord
    const useSecure = await isSecureStoreAvailable();

    if (useSecure) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Fallback vers AsyncStorage
      await AsyncStorage.setItem(key, value);
    }

    console.log(`✓ Token saved for ${service} (secure: ${useSecure})`);
  } catch (error) {
    console.error(`Failed to save token for ${service}:`, error);
    throw new Error(`Token storage failed: ${error}`);
  }
};

/**
 * Récupère un token sauvegardé
 *
 * @param service - Service musical
 * @returns Token sauvegardé ou null si inexistant
 */
export const getToken = async (
  service: MusicService
): Promise<StoredToken | null> => {
  try {
    // Valider le service avant de continuer
    if (!service || service !== MusicService.SPOTIFY) {
      console.warn(`getToken called with invalid service: ${service}. Skipping.`);
      return null;
    }

    const key = getStorageKey(service);

    // Essayer SecureStore d'abord
    const useSecure = await isSecureStoreAvailable();
    let value: string | null = null;

    if (useSecure) {
      value = await SecureStore.getItemAsync(key);
    } else {
      value = await AsyncStorage.getItem(key);
    }

    if (!value) {
      return null;
    }

    const storedToken: StoredToken = JSON.parse(value);
    return storedToken;
  } catch (error) {
    console.error(`Failed to get token for ${service}:`, error);
    return null;
  }
};

/**
 * Supprime un token sauvegardé
 *
 * @param service - Service musical
 * @returns Promise<void>
 */
export const removeToken = async (service: MusicService): Promise<void> => {
  try {
    const key = getStorageKey(service);

    // Supprimer des deux systèmes pour être sûr
    const useSecure = await isSecureStoreAvailable();

    if (useSecure) {
      await SecureStore.deleteItemAsync(key);
    }

    await AsyncStorage.removeItem(key);

    console.log(`✓ Token removed for ${service}`);
  } catch (error) {
    console.error(`Failed to remove token for ${service}:`, error);
    throw new Error(`Token removal failed: ${error}`);
  }
};

/**
 * Met à jour les métadonnées d'un token après un refresh
 *
 * @param service - Service musical
 * @param newToken - Nouveau token après refresh
 * @returns Promise<void>
 */
export const updateTokenAfterRefresh = async (
  service: MusicService,
  newToken: AuthToken
): Promise<void> => {
  try {
    const existingToken = await getToken(service);

    const metadata: TokenMetadata = {
      createdAt: existingToken?.metadata.createdAt || Date.now(),
      expiresAt: newToken.expiresAt,
      lastRefreshedAt: Date.now(),
      refreshCount: (existingToken?.metadata.refreshCount || 0) + 1,
    };

    const storedToken: StoredToken = {
      ...newToken,
      metadata,
    };

    const key = getStorageKey(service);
    const value = JSON.stringify(storedToken);

    const useSecure = await isSecureStoreAvailable();

    if (useSecure) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }

    console.log(
      `✓ Token updated for ${service} (refresh count: ${metadata.refreshCount})`
    );
  } catch (error) {
    console.error(`Failed to update token for ${service}:`, error);
    throw new Error(`Token update failed: ${error}`);
  }
};

/**
 * Valide un token et détermine s'il doit être rafraîchi
 *
 * @param token - Token à valider
 * @param bufferMs - Buffer en millisecondes (défaut: 5 minutes)
 * @returns Résultat de validation
 */
export const validateToken = (
  token: StoredToken | null,
  bufferMs: number = REFRESH_BUFFER_MS
): TokenValidationResult => {
  if (!token) {
    return {
      isValid: false,
      needsRefresh: false,
      error: 'Token not found',
    };
  }

  const now = Date.now();
  const expiresAt = token.metadata.expiresAt;
  const expiresIn = expiresAt - now;

  // Token expiré
  if (expiresIn <= 0) {
    return {
      isValid: false,
      needsRefresh: true,
      expiresIn: 0,
      error: 'Token expired',
    };
  }

  // Token expire bientôt (dans le buffer)
  if (expiresIn <= bufferMs) {
    return {
      isValid: true,
      needsRefresh: true,
      expiresIn,
    };
  }

  // Token valide
  return {
    isValid: true,
    needsRefresh: false,
    expiresIn,
  };
};

/**
 * Récupère un access token valide, avec refresh automatique si nécessaire
 *
 * @param service - Service musical
 * @param refreshCallback - Fonction pour rafraîchir le token si nécessaire
 * @returns Access token valide ou null
 */
export const getValidAccessToken = async (
  service: MusicService,
  refreshCallback?: (refreshToken: string) => Promise<AuthToken>
): Promise<string | null> => {
  try {
    const storedToken = await getToken(service);
    const validation = validateToken(storedToken);

    // Pas de token
    if (!storedToken) {
      return null;
    }

    // Token valide et pas besoin de refresh
    if (validation.isValid && !validation.needsRefresh) {
      return storedToken.accessToken;
    }

    // Token nécessite un refresh
    if (
      validation.needsRefresh &&
      storedToken.refreshToken &&
      refreshCallback
    ) {
      console.log(`⟳ Refreshing token for ${service}...`);
      const newToken = await refreshCallback(storedToken.refreshToken);
      await updateTokenAfterRefresh(service, newToken);
      return newToken.accessToken;
    }

    // Token expiré sans refresh possible
    if (!validation.isValid) {
      console.warn(`⚠️ Token expired for ${service}, re-authentication required`);
      return null;
    }

    return storedToken.accessToken;
  } catch (error) {
    console.error(`Failed to get valid access token for ${service}:`, error);
    return null;
  }
};

/**
 * Supprime tous les tokens sauvegardés
 *
 * @returns Promise<void>
 */
export const clearAllTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      removeToken(MusicService.SPOTIFY),
      removeToken(MusicService.SOUNDCLOUD),
    ]);

    console.log('✓ All tokens cleared');
  } catch (error) {
    console.error('Failed to clear all tokens:', error);
    throw error;
  }
};

/**
 * Vérifie si un service est authentifié
 *
 * @param service - Service musical
 * @returns true si authentifié avec un token valide
 */
export const isServiceAuthenticated = async (
  service: MusicService
): Promise<boolean> => {
  const token = await getToken(service);
  const validation = validateToken(token);
  return validation.isValid;
};

/**
 * Obtient les informations de token pour debug
 *
 * @param service - Service musical
 * @returns Informations de token ou null
 */
export const getTokenInfo = async (
  service: MusicService
): Promise<{
  exists: boolean;
  expiresAt?: string;
  expiresIn?: string;
  refreshCount?: number;
  needsRefresh?: boolean;
} | null> => {
  const token = await getToken(service);

  if (!token) {
    return { exists: false };
  }

  const validation = validateToken(token);
  const expiresInMs = validation.expiresIn || 0;
  const expiresInMinutes = Math.floor(expiresInMs / 1000 / 60);

  return {
    exists: true,
    expiresAt: new Date(token.metadata.expiresAt).toISOString(),
    expiresIn: `${expiresInMinutes} minutes`,
    refreshCount: token.metadata.refreshCount,
    needsRefresh: validation.needsRefresh,
  };
};
