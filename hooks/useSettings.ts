import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { StorageService } from '../services/storageService';
import { useVideoHistory } from './useVideoHistory';
import { Logger } from '../services/logger/Logger';

const SETTINGS_STORAGE_KEY = '@podcut_settings';

export interface AppSettings {
  momentDuration: number; // en secondes
  enableAnimations: boolean;
  enableHapticFeedback: boolean;
  videoQuality: 'auto' | '720p' | '480p' | '360p';
  autoLoadVideos: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface StorageStats {
  totalSpace: number;
  videoCount: number;
  momentCount: number;
  cacheSize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  momentDuration: 30,
  enableAnimations: true,
  enableHapticFeedback: true,
  videoQuality: 'auto',
  autoLoadVideos: true,
  theme: 'system',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSpace: 0,
    videoCount: 0,
    momentCount: 0,
    cacheSize: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { videos, clearAllHistory, getTotalMomentsCount } = useVideoHistory();

  // Load settings from storage
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      Logger.error('useSettings.loadSettings', error instanceof Error ? error : 'Failed to load settings');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        Logger.error('useSettings.saveSettings', error instanceof Error ? error : 'Failed to save settings', { newSettings });
        throw error;
      }
    },
    [settings]
  );

  /**
   * Get directory size safely
   */
  const getDirectorySize = async (directory: string | undefined, dirName: string): Promise<number> => {
    if (!directory) return 0;

    try {
      const dirInfo = await (FileSystem as any).getInfoAsync(directory);
      if (dirInfo.exists) {
        return (dirInfo as any).size || 0;
      }
    } catch (error) {
      Logger.warn('useSettings.calculateStorageStats', `Failed to get ${dirName} size`, error);
    }
    return 0;
  };

  /**
   * Calculate storage statistics
   */
  const calculateStorageStats = useCallback(async () => {
    try {
      const appDir = (FileSystem as any).documentDirectory;
      const cacheDir = (FileSystem as any).cacheDirectory;

      const totalSpace = await getDirectorySize(appDir, 'app directory');
      const cacheSize = await getDirectorySize(cacheDir, 'cache directory');

      setStorageStats({
        totalSpace,
        videoCount: videos.length,
        momentCount: getTotalMomentsCount(),
        cacheSize,
      });
    } catch (error) {
      Logger.error('useSettings.calculateStorageStats', error instanceof Error ? error : 'Failed to calculate storage stats');
    }
  }, [videos, getTotalMomentsCount]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      const cacheDir = (FileSystem as any).cacheDirectory;
      if (cacheDir) {
        try {
          const files = await (FileSystem as any).readDirectoryAsync(cacheDir);
          await Promise.all(
            files.map((file: string) =>
              (FileSystem as any).deleteAsync(`${cacheDir}${file}`, { idempotent: true })
            )
          );
        } catch (error) {
          Logger.warn('useSettings.clearCache', 'Failed to clear some cache files', error);
        }
      }
      await calculateStorageStats();
      Alert.alert('Succès', 'Le cache a été effacé avec succès.');
    } catch (error) {
      Logger.error('useSettings.clearCache', error instanceof Error ? error : 'Failed to clear cache');
      Alert.alert('Erreur', "Impossible d'effacer le cache.");
    }
  }, [calculateStorageStats]);

  // Clear all data with confirmation
  const clearAllData = useCallback(() => {
    Alert.alert(
      'Effacer toutes les données',
      "Êtes-vous sûr de vouloir supprimer tout l'historique et tous les moments ? Cette action est irréversible.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              await clearCache();
              await calculateStorageStats();
              Alert.alert('Succès', 'Toutes les données ont été effacées.');
            } catch (error) {
              Logger.error('useSettings.clearAllData', error instanceof Error ? error : 'Failed to clear all data');
              Alert.alert('Erreur', "Impossible d'effacer toutes les données.");
            }
          },
        },
      ]
    );
  }, [clearAllHistory, clearCache, calculateStorageStats]);

  /**
   * Prepare export data structure
   */
  const prepareExportData = () => ({
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    videos: videos.map(video => ({
      id: video.id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      addedAt: video.addedAt.toISOString(),
      moments: video.moments.map(moment => ({
        id: moment.id,
        timestamp: moment.timestamp,
        duration: moment.duration,
        title: moment.title,
        createdAt: moment.createdAt.toISOString(),
      })),
    })),
    settings,
  });

  /**
   * Write export file to filesystem
   */
  const writeExportFile = async (exportData: any): Promise<string> => {
    const fileName = `podcut-export-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;
    await (FileSystem as any).writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
    return fileUri;
  };

  /**
   * Share or display export file
   */
  const shareExportFile = async (fileUri: string): Promise<void> => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter les moments Moments',
      });
    } else {
      Alert.alert('Succès', `Export sauvegardé dans: ${fileUri}`);
    }
  };

  /**
   * Export moments data
   */
  const exportMoments = useCallback(async () => {
    try {
      const exportData = prepareExportData();
      const fileUri = await writeExportFile(exportData);
      await shareExportFile(fileUri);
    } catch (error) {
      Logger.error('useSettings.exportMoments', error instanceof Error ? error : 'Failed to export moments');
      Alert.alert('Erreur', "Impossible d'exporter les moments.");
    }
  }, [videos, settings]);

  /**
   * Pick and read import file
   */
  const pickImportFile = async (): Promise<any> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      throw new Error('No file selected');
    }

    const content = await (FileSystem as any).readAsStringAsync(result.assets[0].uri);
    return JSON.parse(content);
  };

  /**
   * Validate import data structure
   */
  const validateImportData = (importData: any): void => {
    if (!importData.videos || !Array.isArray(importData.videos)) {
      throw new Error('Format de fichier invalide');
    }
  };

  /**
   * Process import with user confirmation
   */
  const processImportWithConfirmation = (importData: any): void => {
    Alert.alert(
      'Importer les données',
      `Importer ${importData.videos.length} vidéo(s) et leurs moments ? Cela remplacera vos données actuelles.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              Alert.alert('Succès', 'Import en cours de développement...');
            } catch (error) {
              Logger.error('useSettings.importMoments.import', error instanceof Error ? error : 'Failed to import data');
              Alert.alert('Erreur', "Impossible d'importer les données.");
            }
          },
        },
      ]
    );
  };

  /**
   * Import moments data
   */
  const importMoments = useCallback(async () => {
    try {
      const importData = await pickImportFile();
      validateImportData(importData);
      processImportWithConfirmation(importData);
    } catch (error) {
      Logger.error('useSettings.importMoments', error instanceof Error ? error : 'Failed to import moments');
      Alert.alert('Erreur', "Fichier invalide ou erreur d'import.");
    }
  }, [clearAllHistory]);

  // Open external links
  const openTermsOfService = useCallback(() => {
    Linking.openURL('https://podcut.app/terms');
  }, []);

  const openPrivacyPolicy = useCallback(() => {
    Linking.openURL('https://podcut.app/privacy');
  }, []);

  const reportBug = useCallback(() => {
    const subject = 'Bug Report - Moments Mobile';
    const body = `Décrivez le problème rencontré:

Version de l'app: 1.0.0
Plateforme: ${Platform.OS} ${Platform.Version}
Statistiques:
- Vidéos: ${storageStats.videoCount}
- Moments: ${storageStats.momentCount}
- Espace utilisé: ${(storageStats.totalSpace / 1024 / 1024).toFixed(2)} MB

Détails du problème:
`;

    Linking.openURL(
      `mailto:support@podcut.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  }, [storageStats]);

  const rateApp = useCallback(() => {
    const appId = Platform.OS === 'ios' ? 'id123456789' : 'com.podcut.mobile';
    const url =
      Platform.OS === 'ios'
        ? `https://apps.apple.com/app/${appId}?action=write-review`
        : `market://details?id=${appId}`;

    Linking.openURL(url);
  }, []);

  // Load settings and calculate stats on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    calculateStorageStats();
  }, [calculateStorageStats]);

  return {
    settings,
    storageStats,
    isLoading,

    // Settings actions
    updateSetting: saveSettings,

    // Storage actions
    clearCache,
    clearAllData,
    refreshStorageStats: calculateStorageStats,

    // Data management
    exportMoments,
    importMoments,

    // External actions
    openTermsOfService,
    openPrivacyPolicy,
    reportBug,
    rateApp,
  };
};
