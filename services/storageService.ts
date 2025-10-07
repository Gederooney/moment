import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger/Logger';

export class StorageService {
  private static readonly SETTINGS_KEY = 'podcut_settings';

  // Settings Management
  static async getSettings(): Promise<Record<string, any>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {};
    } catch (error) {
      Logger.error('StorageService.getSettings', error instanceof Error ? error : 'Failed to get settings');
      return {};
    }
  }

  static async setSetting(key: string, value: any): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      Logger.error('StorageService.setSetting', error instanceof Error ? error : 'Failed to set setting', { key, value });
      throw error;
    }
  }

  static async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const settings = await this.getSettings();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (error) {
      Logger.error('StorageService.getSetting', error instanceof Error ? error : 'Failed to get setting', { key });
      return defaultValue;
    }
  }
}
