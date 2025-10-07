/**
 * Tests for migrationService
 * Coverage: migration logic, schema versioning, error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MigrationService } from '../migrationService';
import { STORAGE_KEYS, SCHEMA_VERSION } from '../../utils/storage';
import { CapturedMoment } from '../../types/moment';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('MigrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('needsMigration', () => {
    it('should return true if schema version is less than current', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');

      const result = await MigrationService.needsMigration();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SCHEMA_VERSION);
    });

    it('should return false if schema version is equal to current', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(SCHEMA_VERSION.toString());

      const result = await MigrationService.needsMigration();

      expect(result).toBe(false);
    });

    it('should return true if schema version is missing (defaults to 0)', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await MigrationService.needsMigration();

      expect(result).toBe(true);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current schema version from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');

      const version = await MigrationService.getCurrentVersion();

      expect(version).toBe(1);
    });

    it('should return 0 if schema version is not set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const version = await MigrationService.getCurrentVersion();

      expect(version).toBe(0);
    });
  });

  describe('migrateOldMomentsToNewFormat', () => {
    it('should convert old CapturedMoment[] to new YouTubeMoment[] format', async () => {
      const oldMoments: CapturedMoment[] = [
        {
          id: 'moment-1',
          videoId: 'abc123',
          timestamp: 120,
          duration: 30,
          title: 'Test Moment',
          createdAt: new Date('2025-01-01'),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldMoments));

      await MigrationService.migrateOldMomentsToNewFormat();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOMENTS_V2,
        expect.stringContaining('"type":"youtube_timestamp"')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOMENTS_V2,
        expect.stringContaining('"notes":""')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOMENTS_V2,
        expect.stringContaining('"tags":[]')
      );
    });

    it('should handle empty database gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await expect(MigrationService.migrateOldMomentsToNewFormat()).resolves.not.toThrow();
    });

    it('should handle corrupted data and throw error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      await expect(MigrationService.migrateOldMomentsToNewFormat()).rejects.toThrow();
    });

    it('should add videoMetadata structure to migrated moments', async () => {
      const oldMoments: CapturedMoment[] = [
        {
          id: 'moment-1',
          videoId: 'abc123',
          timestamp: 120,
          duration: 30,
          title: 'Test Moment',
          createdAt: new Date(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldMoments));

      await MigrationService.migrateOldMomentsToNewFormat();

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0] === STORAGE_KEYS.MOMENTS_V2
      );
      expect(savedData).toBeDefined();
      const parsedData = JSON.parse(savedData[1]);
      expect(parsedData[0]).toHaveProperty('videoMetadata');
      expect(parsedData[0].videoMetadata).toHaveProperty('title');
      expect(parsedData[0].videoMetadata).toHaveProperty('thumbnail');
      expect(parsedData[0].videoMetadata).toHaveProperty('url');
    });
  });

  describe('migrateWithErrorHandling', () => {
    it('should successfully migrate valid moments', async () => {
      const oldMoments: CapturedMoment[] = [
        {
          id: 'moment-1',
          videoId: 'abc123',
          timestamp: 120,
          duration: 30,
          title: 'Test Moment',
          createdAt: new Date(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldMoments));

      const result = await MigrationService.migrateWithErrorHandling();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip invalid moments and continue', async () => {
      const oldMoments = [
        {
          id: 'moment-1',
          videoId: 'abc123',
          timestamp: 120,
          duration: 30,
          title: 'Valid Moment',
          createdAt: new Date(),
        },
        {
          id: '', // Invalid - missing ID
          videoId: 'xyz789',
          timestamp: 60,
          duration: 30,
          title: 'Invalid Moment',
          createdAt: new Date(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldMoments));

      const result = await MigrationService.migrateWithErrorHandling();

      expect(result.migratedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('runMigrations', () => {
    it('should run migration if current version is less than target', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('1') // getCurrentVersion
        .mockResolvedValueOnce(JSON.stringify([])); // loadMoments

      await MigrationService.runMigrations();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SCHEMA_VERSION,
        SCHEMA_VERSION.toString()
      );
    });

    it('should skip migration if already up to date', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(SCHEMA_VERSION.toString());

      await MigrationService.runMigrations();

      // Should not update schema version if already current
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
        STORAGE_KEYS.SCHEMA_VERSION,
        expect.any(String)
      );
    });
  });

  describe('updateSchemaVersion', () => {
    it('should update schema version in storage', async () => {
      await MigrationService.updateSchemaVersion(2);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.SCHEMA_VERSION, '2');
    });
  });
});
