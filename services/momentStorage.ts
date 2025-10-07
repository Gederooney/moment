/**
 * Storage service for moments (YouTube timestamps and screen recording clips)
 * Handles serialization, deserialization, and CRUD operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moment, YouTubeMoment, ScreenRecordingMoment } from '../types/moment';
import { STORAGE_KEYS, SCHEMA_VERSION } from '../utils/storage';

export class MomentStorage {
  /**
   * Save moments to AsyncStorage
   * Serializes Date objects to ISO strings
   */
  static async saveMoments(moments: Moment[]): Promise<void> {
    try {
      const serializedMoments = moments.map((moment) => ({
        ...moment,
        createdAt: moment.createdAt.toISOString(),
        updatedAt: moment.updatedAt?.toISOString(),
      }));

      await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS_V2, JSON.stringify(serializedMoments));
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION.toString());
    } catch (error) {
      console.error('[MomentStorage] Error saving moments:', error);
      throw new Error('Failed to save moments');
    }
  }

  /**
   * Load moments from AsyncStorage
   * Deserializes ISO strings back to Date objects
   */
  static async loadMoments(): Promise<Moment[]> {
    try {
      const momentsData = await AsyncStorage.getItem(STORAGE_KEYS.MOMENTS_V2);

      if (!momentsData) {
        return [];
      }

      const parsedMoments = JSON.parse(momentsData);

      if (!Array.isArray(parsedMoments)) {
        console.error('[MomentStorage] Moments data is not an array');
        return [];
      }

      // Deserialize dates and validate moment types
      return parsedMoments.map((moment: any) => {
        const baseMoment = {
          ...moment,
          createdAt: new Date(moment.createdAt),
          updatedAt: moment.updatedAt ? new Date(moment.updatedAt) : undefined,
        };

        // Type guard and return appropriate type
        if (moment.type === 'youtube_timestamp') {
          return baseMoment as YouTubeMoment;
        } else if (moment.type === 'screen_recording') {
          return baseMoment as ScreenRecordingMoment;
        } else {
          console.warn(`[MomentStorage] Unknown moment type: ${moment.type}`);
          return baseMoment as Moment;
        }
      });
    } catch (error) {
      console.error('[MomentStorage] Error loading moments:', error);
      return [];
    }
  }

  /**
   * Get moment by ID
   */
  static async getMomentById(id: string): Promise<Moment | null> {
    try {
      const moments = await this.loadMoments();
      return moments.find((m) => m.id === id) || null;
    } catch (error) {
      console.error('[MomentStorage] Error getting moment by ID:', error);
      return null;
    }
  }

  /**
   * Add a new moment
   */
  static async addMoment(moment: Moment): Promise<void> {
    try {
      const moments = await this.loadMoments();
      moments.push(moment);
      await this.saveMoments(moments);
    } catch (error) {
      console.error('[MomentStorage] Error adding moment:', error);
      throw new Error('Failed to add moment');
    }
  }

  /**
   * Update an existing moment (partial update)
   * Supports updating notes, tags, title, etc.
   */
  static async updateMoment(id: string, updates: Partial<Moment>): Promise<void> {
    try {
      const moments = await this.loadMoments();
      const index = moments.findIndex((m) => m.id === id);

      if (index === -1) {
        throw new Error(`Moment with ID ${id} not found`);
      }

      // Merge updates with existing moment
      moments[index] = {
        ...moments[index],
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date(),
      };

      await this.saveMoments(moments);
    } catch (error) {
      console.error('[MomentStorage] Error updating moment:', error);
      throw new Error('Failed to update moment');
    }
  }

  /**
   * Delete a moment
   * For screen recording moments, also deletes the video file
   */
  static async deleteMoment(id: string): Promise<void> {
    try {
      const moments = await this.loadMoments();
      const momentToDelete = moments.find((m) => m.id === id);

      if (!momentToDelete) {
        console.warn(`[MomentStorage] Moment ${id} not found, nothing to delete`);
        return;
      }

      // If it's a screen recording, delete the video file
      if (momentToDelete.type === 'screen_recording') {
        // TODO: Implement file deletion using expo-file-system
        // await FileSystem.deleteAsync(momentToDelete.videoFilePath, { idempotent: true });
        // if (momentToDelete.thumbnailPath) {
        //   await FileSystem.deleteAsync(momentToDelete.thumbnailPath, { idempotent: true });
        // }
        console.log(
          `[MomentStorage] Screen recording deletion not yet implemented: ${momentToDelete.videoFilePath}`
        );
      }

      // Remove from array
      const updatedMoments = moments.filter((m) => m.id !== id);
      await this.saveMoments(updatedMoments);
    } catch (error) {
      console.error('[MomentStorage] Error deleting moment:', error);
      throw new Error('Failed to delete moment');
    }
  }

  /**
   * Get moments by type
   */
  static async getMomentsByType(type: 'youtube_timestamp' | 'screen_recording'): Promise<Moment[]> {
    try {
      const moments = await this.loadMoments();
      return moments.filter((m) => m.type === type);
    } catch (error) {
      console.error('[MomentStorage] Error filtering moments by type:', error);
      return [];
    }
  }

  /**
   * Get moments by tag
   */
  static async getMomentsByTag(tag: string): Promise<Moment[]> {
    try {
      const moments = await this.loadMoments();
      return moments.filter((m) => m.tags && m.tags.includes(tag));
    } catch (error) {
      console.error('[MomentStorage] Error filtering moments by tag:', error);
      return [];
    }
  }

  /**
   * Get moments for a specific video (YouTube only)
   */
  static async getMomentsForVideo(videoId: string): Promise<YouTubeMoment[]> {
    try {
      const moments = await this.loadMoments();
      return moments.filter(
        (m) => m.type === 'youtube_timestamp' && m.videoId === videoId
      ) as YouTubeMoment[];
    } catch (error) {
      console.error('[MomentStorage] Error getting moments for video:', error);
      return [];
    }
  }

  /**
   * Search moments by title or notes
   */
  static async searchMoments(query: string): Promise<Moment[]> {
    try {
      const moments = await this.loadMoments();
      const lowerQuery = query.toLowerCase();

      return moments.filter((m) => {
        const titleMatch = m.title.toLowerCase().includes(lowerQuery);
        const notesMatch = m.notes?.toLowerCase().includes(lowerQuery);
        return titleMatch || notesMatch;
      });
    } catch (error) {
      console.error('[MomentStorage] Error searching moments:', error);
      return [];
    }
  }

  /**
   * Clear all moments (dangerous - use with caution)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.MOMENTS_V2);
    } catch (error) {
      console.error('[MomentStorage] Error clearing moments:', error);
      throw new Error('Failed to clear moments');
    }
  }

  /**
   * Get total moments count
   */
  static async getCount(): Promise<number> {
    try {
      const moments = await this.loadMoments();
      return moments.length;
    } catch (error) {
      console.error('[MomentStorage] Error getting count:', error);
      return 0;
    }
  }

  /**
   * Get moments count by type
   */
  static async getCountByType(): Promise<{
    youtube: number;
    screenRecording: number;
    total: number;
  }> {
    try {
      const moments = await this.loadMoments();
      const youtube = moments.filter((m) => m.type === 'youtube_timestamp').length;
      const screenRecording = moments.filter((m) => m.type === 'screen_recording').length;

      return {
        youtube,
        screenRecording,
        total: moments.length,
      };
    } catch (error) {
      console.error('[MomentStorage] Error getting count by type:', error);
      return { youtube: 0, screenRecording: 0, total: 0 };
    }
  }
}
