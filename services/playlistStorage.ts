import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, PlaylistVideo } from '../types/playlist';

const STORAGE_KEYS = {
  PLAYLISTS: '@podcut_playlists',
  ACTIVE_PLAYLIST_ID: '@podcut_active_playlist_id',
  SCHEMA_VERSION: '@podcut_playlist_schema_version',
} as const;

const CURRENT_SCHEMA_VERSION = 1;

export class PlaylistStorage {
  static async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      const serializedPlaylists = playlists.map(playlist => ({
        ...playlist,
        createdAt: playlist.createdAt.toISOString(),
        updatedAt: playlist.updatedAt.toISOString(),
        videos: playlist.videos.map(video => ({
          ...video,
          addedAt: video.addedAt.toISOString(),
        })),
      }));

      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(serializedPlaylists));
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
    } catch (error) {
      throw new Error('Failed to save playlists');
    }
  }

  static async loadPlaylists(): Promise<Playlist[]> {
    try {
      const [playlistsData, schemaVersion] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
        AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION),
      ]);

      if (!playlistsData) {
        return [];
      }

      // Check if migration is needed
      const currentVersion = schemaVersion ? parseInt(schemaVersion, 10) : 0;
      let parsedPlaylists = JSON.parse(playlistsData);

      if (currentVersion < CURRENT_SCHEMA_VERSION) {
        parsedPlaylists = await this.migrateSchema(parsedPlaylists, currentVersion);
      }

      // Convert date strings back to Date objects
      return parsedPlaylists.map((playlist: any) => ({
        ...playlist,
        createdAt: new Date(playlist.createdAt),
        updatedAt: new Date(playlist.updatedAt),
        videos: playlist.videos.map((video: any) => ({
          ...video,
          addedAt: new Date(video.addedAt),
        })),
      }));
    } catch (error) {
      return [];
    }
  }

  static async saveActivePlaylistId(playlistId: string | null): Promise<void> {
    try {
      if (playlistId) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID, playlistId);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID);
      }
    } catch (error) {}
  }

  static async loadActivePlaylistId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID);
    } catch (error) {
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PLAYLISTS),
        AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYLIST_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION),
      ]);
    } catch (error) {}
  }

  private static async migrateSchema(playlists: any[], fromVersion: number): Promise<any[]> {
    let migratedPlaylists = [...playlists];

    // Example migration (add future migrations here)
    if (fromVersion < 1) {
      migratedPlaylists = migratedPlaylists.map(playlist => ({
        ...playlist,
        settings: playlist.settings || {
          autoPlay: true,
          shuffle: false,
          repeat: 'none',
        },
        currentIndex: playlist.currentIndex || 0,
        isActive: playlist.isActive || false,
      }));
    }

    return migratedPlaylists;
  }

  static async exportPlaylists(): Promise<string> {
    try {
      const playlists = await this.loadPlaylists();
      return JSON.stringify(playlists, null, 2);
    } catch (error) {
      throw new Error('Failed to export playlists');
    }
  }

  static async importPlaylists(data: string): Promise<void> {
    try {
      const playlists = JSON.parse(data);

      // Validate the imported data
      if (!Array.isArray(playlists)) {
        throw new Error('Invalid playlist data format');
      }

      // Convert to proper format and save
      const validatedPlaylists: Playlist[] = playlists.map(playlist => ({
        ...playlist,
        createdAt: new Date(playlist.createdAt),
        updatedAt: new Date(playlist.updatedAt),
        videos: playlist.videos.map((video: any) => ({
          ...video,
          addedAt: new Date(video.addedAt),
        })),
      }));

      await this.savePlaylists(validatedPlaylists);
    } catch (error) {
      throw new Error('Failed to import playlists');
    }
  }

  static async cleanupOrphanedData(): Promise<void> {
    try {
      const playlists = await this.loadPlaylists();
      const activePlaylistId = await this.loadActivePlaylistId();

      // Remove active playlist if it doesn't exist anymore
      if (activePlaylistId && !playlists.some(p => p.id === activePlaylistId)) {
        await this.saveActivePlaylistId(null);
      }

      // Remove duplicate videos in playlists
      const cleanedPlaylists = playlists.map(playlist => ({
        ...playlist,
        videos: playlist.videos.filter(
          (video, index, arr) => arr.findIndex(v => v.videoId === video.videoId) === index
        ),
      }));

      await this.savePlaylists(cleanedPlaylists);
    } catch (error) {}
  }
}
