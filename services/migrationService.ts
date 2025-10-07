/**
 * Migration service for migrating data from old schema to new schema
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHEMA_VERSION, STORAGE_KEYS } from '../utils/storage';
import { CapturedMoment, YouTubeMoment } from '../types/moment';
import { getVideoThumbnail } from '../utils/youtube';

export class MigrationService {
  /**
   * Check if migration is needed
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const currentVersionString = await AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      const currentVersion = currentVersionString ? parseInt(currentVersionString, 10) : 0;

      return currentVersion < SCHEMA_VERSION;
    } catch (error) {
      console.error('[MigrationService] Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Get current schema version from storage
   */
  static async getCurrentVersion(): Promise<number> {
    try {
      const versionString = await AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      return versionString ? parseInt(versionString, 10) : 0;
    } catch (error) {
      console.error('[MigrationService] Error getting current version:', error);
      return 0;
    }
  }

  /**
   * Update schema version in storage
   */
  static async updateSchemaVersion(version: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, version.toString());
    } catch (error) {
      console.error('[MigrationService] Error updating schema version:', error);
      throw error;
    }
  }

  /**
   * Migrate old moments (CapturedMoment[]) to new format (YouTubeMoment[])
   * Converts v1 moments to v2 moments with:
   * - type: 'youtube_timestamp'
   * - notes: '' (empty)
   * - tags: [] (empty array)
   * - videoMetadata structure
   */
  static async migrateOldMomentsToNewFormat(): Promise<void> {
    try {
      console.log('[MigrationService] Starting moment migration...');

      // Load old moments from v1 key
      const oldMomentsData = await AsyncStorage.getItem(STORAGE_KEYS.MOMENTS_V1);

      if (!oldMomentsData) {
        console.log('[MigrationService] No old moments found, skipping migration');
        return;
      }

      // Parse old moments
      const oldMoments: CapturedMoment[] = JSON.parse(oldMomentsData);

      if (!Array.isArray(oldMoments) || oldMoments.length === 0) {
        console.log('[MigrationService] No moments to migrate');
        return;
      }

      console.log(`[MigrationService] Found ${oldMoments.length} moments to migrate`);

      // Convert to new format
      const newMoments: YouTubeMoment[] = oldMoments.map((oldMoment) => ({
        id: oldMoment.id,
        type: 'youtube_timestamp' as const,
        videoId: oldMoment.videoId,
        timestamp: oldMoment.timestamp,
        duration: oldMoment.duration,
        title: oldMoment.title,
        notes: '', // empty notes
        tags: [], // empty tags array
        createdAt:
          typeof oldMoment.createdAt === 'string'
            ? new Date(oldMoment.createdAt)
            : oldMoment.createdAt,
        videoMetadata: {
          title: oldMoment.title || 'YouTube Video',
          thumbnail: getVideoThumbnail(oldMoment.videoId),
          url: `https://youtube.com/watch?v=${oldMoment.videoId}`,
        },
      }));

      // Serialize new moments for storage
      const serializedMoments = newMoments.map((moment) => ({
        ...moment,
        createdAt: moment.createdAt.toISOString(),
      }));

      // Save to new key
      await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS_V2, JSON.stringify(serializedMoments));

      console.log(`[MigrationService] Successfully migrated ${newMoments.length} moments`);

      // Optionally: Remove old data (commented out for safety - user can manually clean up)
      // await AsyncStorage.removeItem(STORAGE_KEYS.MOMENTS_V1);
    } catch (error) {
      console.error('[MigrationService] Error migrating moments:', error);
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle corrupted data during migration
   * Attempts to recover what it can, logs errors for the rest
   */
  static async migrateWithErrorHandling(): Promise<{
    success: boolean;
    migratedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [] as string[],
    };

    try {
      const oldMomentsData = await AsyncStorage.getItem(STORAGE_KEYS.MOMENTS_V1);

      if (!oldMomentsData) {
        return result;
      }

      const oldMoments: CapturedMoment[] = JSON.parse(oldMomentsData);

      if (!Array.isArray(oldMoments)) {
        result.success = false;
        result.errors.push('Old moments data is not an array');
        return result;
      }

      const newMoments: YouTubeMoment[] = [];

      for (const oldMoment of oldMoments) {
        try {
          // Validate required fields
          if (!oldMoment.id || !oldMoment.videoId || oldMoment.timestamp === undefined) {
            result.failedCount++;
            result.errors.push(`Invalid moment: missing required fields (id: ${oldMoment.id})`);
            continue;
          }

          const newMoment: YouTubeMoment = {
            id: oldMoment.id,
            type: 'youtube_timestamp',
            videoId: oldMoment.videoId,
            timestamp: oldMoment.timestamp,
            duration: oldMoment.duration || 30, // default duration
            title: oldMoment.title || 'Untitled Moment',
            notes: '',
            tags: [],
            createdAt:
              typeof oldMoment.createdAt === 'string'
                ? new Date(oldMoment.createdAt)
                : oldMoment.createdAt || new Date(),
            videoMetadata: {
              title: oldMoment.title || 'YouTube Video',
              thumbnail: getVideoThumbnail(oldMoment.videoId),
              url: `https://youtube.com/watch?v=${oldMoment.videoId}`,
            },
          };

          newMoments.push(newMoment);
          result.migratedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(
            `Failed to migrate moment ${oldMoment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Save successfully migrated moments
      if (newMoments.length > 0) {
        const serializedMoments = newMoments.map((moment) => ({
          ...moment,
          createdAt: moment.createdAt.toISOString(),
        }));

        await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS_V2, JSON.stringify(serializedMoments));
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(
        `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return result;
    }
  }

  /**
   * Run all necessary migrations based on current version
   */
  static async runMigrations(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();

      console.log(`[MigrationService] Current schema version: ${currentVersion}`);
      console.log(`[MigrationService] Target schema version: ${SCHEMA_VERSION}`);

      if (currentVersion >= SCHEMA_VERSION) {
        console.log('[MigrationService] No migration needed');
        return;
      }

      // Run migrations in sequence
      if (currentVersion < 2) {
        console.log('[MigrationService] Running migration v1 -> v2');
        await this.migrateOldMomentsToNewFormat();
      }

      // Future migrations can be added here
      // if (currentVersion < 3) {
      //   await this.migrateV2ToV3();
      // }

      // Update schema version
      await this.updateSchemaVersion(SCHEMA_VERSION);

      console.log('[MigrationService] Migration complete');
    } catch (error) {
      console.error('[MigrationService] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Reset migration (for testing purposes - use with caution)
   */
  static async resetMigration(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
      console.log('[MigrationService] Migration status reset');
    } catch (error) {
      console.error('[MigrationService] Error resetting migration:', error);
      throw error;
    }
  }
}
