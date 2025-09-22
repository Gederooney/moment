import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.error('Error getting download history:', error);
      return [];
    }
  }

  static async addToHistory(download: DownloadHistory): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      const updatedHistory = [download, ...history.slice(0, 49)]; // Keep last 50 downloads
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }

  static async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // Settings Management
  static async getSettings(): Promise<Record<string, any>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  static async setSetting(key: string, value: any): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error setting config:', error);
    }
  }

  static async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const settings = await this.getSettings();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }
}