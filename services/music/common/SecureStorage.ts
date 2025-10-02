/**
 * Wrapper sécurisé pour expo-secure-store
 * Gestion des tokens OAuth avec chiffrement
 */

import * as SecureStore from 'expo-secure-store';
import { Logger } from '../../logger/Logger';
import { OAuthTokens } from './types';

const CONTEXT = 'SecureStorage';

export class SecureStorage {
  /**
   * Sauvegarde les tokens OAuth de manière sécurisée
   */
  static async saveTokens(
    service: 'spotify' | 'soundcloud',
    tokens: OAuthTokens
  ): Promise<void> {
    try {
      const key = `${service}_tokens`;
      const value = JSON.stringify(tokens);

      await SecureStore.setItemAsync(key, value);
      Logger.info(CONTEXT, `Tokens saved for ${service}`);
    } catch (error) {
      Logger.error(CONTEXT, `Failed to save tokens for ${service}`, error);
      throw error;
    }
  }

  /**
   * Récupère les tokens OAuth
   */
  static async getTokens(
    service: 'spotify' | 'soundcloud'
  ): Promise<OAuthTokens | null> {
    try {
      const key = `${service}_tokens`;
      const value = await SecureStore.getItemAsync(key);

      if (!value) {
        Logger.debug(CONTEXT, `No tokens found for ${service}`);
        return null;
      }

      const tokens = JSON.parse(value) as OAuthTokens;
      Logger.info(CONTEXT, `Tokens retrieved for ${service}`);
      return tokens;
    } catch (error) {
      Logger.error(CONTEXT, `Failed to get tokens for ${service}`, error);
      return null;
    }
  }

  /**
   * Supprime les tokens OAuth
   */
  static async deleteTokens(
    service: 'spotify' | 'soundcloud'
  ): Promise<void> {
    try {
      const key = `${service}_tokens`;
      await SecureStore.deleteItemAsync(key);
      Logger.info(CONTEXT, `Tokens deleted for ${service}`);
    } catch (error) {
      Logger.error(CONTEXT, `Failed to delete tokens for ${service}`, error);
      throw error;
    }
  }

  /**
   * Vérifie si les tokens sont expirés
   */
  static isTokenExpired(tokens: OAuthTokens): boolean {
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes de marge
    return tokens.expiresAt - bufferTime < now;
  }
}
