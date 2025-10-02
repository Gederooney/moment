/**
 * Service de stockage sécurisé pour PodCut
 * Utilise iOS Keychain et Android Keystore
 */

import * as SecureStore from 'expo-secure-store';
import { Logger } from '../logger/Logger';

export class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      Logger.info('SecureStorage.setItem', `Stored ${key}`);
    } catch (error) {
      Logger.error('SecureStorage.setItem', error as Error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      Logger.info('SecureStorage.getItem', `Retrieved ${key}`);
      return value;
    } catch (error) {
      Logger.error('SecureStorage.getItem', error as Error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      Logger.info('SecureStorage.removeItem', `Deleted ${key}`);
    } catch (error) {
      Logger.error('SecureStorage.removeItem', error as Error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = [
        'spotify_access_token',
        'spotify_refresh_token',
        'spotify_token_expiry',
      ];
      await Promise.all(keys.map((key) => this.removeItem(key)));
      Logger.info('SecureStorage.clear', 'Cleared all Spotify tokens');
    } catch (error) {
      Logger.error('SecureStorage.clear', error as Error);
      throw error;
    }
  }
}
