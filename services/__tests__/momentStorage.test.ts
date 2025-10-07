/**
 * Tests for momentStorage
 * Coverage: save/load, CRUD operations, filtering
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MomentStorage } from '../momentStorage';
import { YouTubeMoment, ScreenRecordingMoment } from '../../types/moment';
import { STORAGE_KEYS } from '../../utils/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('MomentStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleYouTubeMoment: YouTubeMoment = {
    id: 'yt-1',
    type: 'youtube_timestamp',
    videoId: 'abc123',
    timestamp: 120,
    duration: 30,
    title: 'YouTube Moment',
    notes: 'Test notes',
    tags: ['test', 'youtube'],
    createdAt: new Date('2025-01-01'),
    videoMetadata: {
      title: 'Test Video',
      thumbnail: 'https://example.com/thumb.jpg',
      url: 'https://youtube.com/watch?v=abc123',
    },
  };

  const sampleScreenRecordingMoment: ScreenRecordingMoment = {
    id: 'sr-1',
    type: 'screen_recording',
    videoFilePath: '/path/to/video.mp4',
    duration: 60,
    title: 'Screen Recording Moment',
    notes: 'Screen recording notes',
    tags: ['screen', 'tiktok'],
    createdAt: new Date('2025-01-02'),
    fileSize: 5000000,
  };

  describe('saveMoments', () => {
    it('should serialize and save moments to AsyncStorage', async () => {
      await MomentStorage.saveMoments([sampleYouTubeMoment]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOMENTS_V2,
        expect.stringContaining('"type":"youtube_timestamp"')
      );
    });

    it('should serialize Date objects to ISO strings', async () => {
      await MomentStorage.saveMoments([sampleYouTubeMoment]);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(typeof parsedData[0].createdAt).toBe('string');
    });
  });

  describe('loadMoments', () => {
    it('should deserialize and load moments from AsyncStorage', async () => {
      const serializedMoments = JSON.stringify([
        {
          ...sampleYouTubeMoment,
          createdAt: sampleYouTubeMoment.createdAt.toISOString(),
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      const moments = await MomentStorage.loadMoments();

      expect(moments).toHaveLength(1);
      expect(moments[0].type).toBe('youtube_timestamp');
      expect(moments[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array if no moments stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const moments = await MomentStorage.loadMoments();

      expect(moments).toEqual([]);
    });

    it('should handle both YouTube and screen recording moments', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
        {
          ...sampleScreenRecordingMoment,
          createdAt: sampleScreenRecordingMoment.createdAt.toISOString(),
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      const moments = await MomentStorage.loadMoments();

      expect(moments).toHaveLength(2);
      expect(moments[0].type).toBe('youtube_timestamp');
      expect(moments[1].type).toBe('screen_recording');
    });
  });

  describe('getMomentById', () => {
    it('should retrieve moment by ID', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      const moment = await MomentStorage.getMomentById('yt-1');

      expect(moment).not.toBeNull();
      expect(moment?.id).toBe('yt-1');
    });

    it('should return null if moment not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      const moment = await MomentStorage.getMomentById('non-existent');

      expect(moment).toBeNull();
    });
  });

  describe('updateMoment', () => {
    it('should update moment with partial updates', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      await MomentStorage.updateMoment('yt-1', {
        notes: 'Updated notes',
        tags: ['updated', 'tags'],
      });

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData[0].notes).toBe('Updated notes');
      expect(parsedData[0].tags).toEqual(['updated', 'tags']);
      expect(parsedData[0].updatedAt).toBeDefined();
    });
  });

  describe('deleteMoment', () => {
    it('should remove moment from storage', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      await MomentStorage.deleteMoment('yt-1');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toHaveLength(0);
    });
  });

  describe('getMomentsByType', () => {
    it('should filter moments by type', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
        {
          ...sampleScreenRecordingMoment,
          createdAt: sampleScreenRecordingMoment.createdAt.toISOString(),
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      const youtubeMoments = await MomentStorage.getMomentsByType('youtube_timestamp');
      const screenMoments = await MomentStorage.getMomentsByType('screen_recording');

      expect(youtubeMoments).toHaveLength(1);
      expect(screenMoments).toHaveLength(1);
    });
  });

  describe('searchMoments', () => {
    it('should search moments by title and notes', async () => {
      const serializedMoments = JSON.stringify([
        { ...sampleYouTubeMoment, createdAt: sampleYouTubeMoment.createdAt.toISOString() },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(serializedMoments);

      const results = await MomentStorage.searchMoments('YouTube');

      expect(results).toHaveLength(1);
    });
  });
});
