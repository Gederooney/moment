import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger/Logger';

export interface DownloadHistory {
  id: string;
  title: string;
  originalUrl: string;
  audioUrl: string;
  thumbnail: string;
  downloadDate: string;
  duration: number;
  author: string;
}

export class StorageService {
  private static readonly HISTORY_KEY = 'podcut_download_history';
  private static readonly SETTINGS_KEY = 'podcut_settings';

  // Download History Management
  static async getDownloadHistory(): Promise<DownloadHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      Logger.error('StorageService.getDownloadHistory', error instanceof Error ? error : 'Failed to get download history');
      return [];
    }
  }

  static async addToHistory(download: DownloadHistory): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      const updatedHistory = [download, ...history.slice(0, 49)]; // Keep last 50 downloads
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      Logger.error('StorageService.addToHistory', error instanceof Error ? error : 'Failed to add to history', { downloadId: download.id });
      throw error;
    }
  }

  static async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      Logger.error('StorageService.removeFromHistory', error instanceof Error ? error : 'Failed to remove from history', { id });
      throw error;
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      Logger.error('StorageService.clearHistory', error instanceof Error ? error : 'Failed to clear history');
      throw error;
    }
  }

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
