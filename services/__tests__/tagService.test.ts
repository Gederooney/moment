/**
 * Tests for tagService
 * Coverage: tag extraction, autocomplete, tag management
 */

import { TagService } from '../tagService';
import { MomentStorage } from '../momentStorage';
import { YouTubeMoment } from '../../types/moment';

// Mock MomentStorage
jest.mock('../momentStorage');

describe('TagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TagService.invalidateCache();
  });

  // Function to get fresh sample moments (prevents mutation issues)
  const getSampleMoments = (): YouTubeMoment[] => [
    {
      id: 'moment-1',
      type: 'youtube_timestamp',
      videoId: 'abc123',
      timestamp: 120,
      duration: 30,
      title: 'Moment 1',
      tags: ['javascript', 'tutorial', 'react'],
      createdAt: new Date(),
      videoMetadata: {
        title: 'Test',
        thumbnail: 'thumb.jpg',
        url: 'https://youtube.com/watch?v=abc123',
      },
    },
    {
      id: 'moment-2',
      type: 'youtube_timestamp',
      videoId: 'xyz789',
      timestamp: 60,
      duration: 30,
      title: 'Moment 2',
      tags: ['javascript', 'nodejs'],
      createdAt: new Date(),
      videoMetadata: {
        title: 'Test 2',
        thumbnail: 'thumb2.jpg',
        url: 'https://youtube.com/watch?v=xyz789',
      },
    },
    {
      id: 'moment-3',
      type: 'youtube_timestamp',
      videoId: 'def456',
      timestamp: 90,
      duration: 30,
      title: 'Moment 3',
      tags: ['python'],
      createdAt: new Date(),
      videoMetadata: {
        title: 'Test 3',
        thumbnail: 'thumb3.jpg',
        url: 'https://youtube.com/watch?v=def456',
      },
    },
  ];

  describe('getAllTags', () => {
    it('should extract unique tags from all moments', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const tags = await TagService.getAllTags();

      expect(tags).toContain('javascript');
      expect(tags).toContain('tutorial');
      expect(tags).toContain('react');
      expect(tags).toContain('nodejs');
      expect(tags).toContain('python');
    });

    it('should sort tags by usage count (most popular first)', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const tags = await TagService.getAllTags();

      // 'javascript' appears twice, should be first
      expect(tags[0]).toBe('javascript');
    });

    it('should handle moments without tags', async () => {
      const momentsWithoutTags: YouTubeMoment[] = [
        {
          id: 'moment-1',
          type: 'youtube_timestamp',
          videoId: 'abc123',
          timestamp: 120,
          duration: 30,
          title: 'Moment 1',
          createdAt: new Date(),
          videoMetadata: {
            title: 'Test',
            thumbnail: 'thumb.jpg',
            url: 'https://youtube.com/watch?v=abc123',
          },
        },
      ];

      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(momentsWithoutTags);

      const tags = await TagService.getAllTags();

      expect(tags).toEqual([]);
    });
  });

  describe('getTagSuggestions', () => {
    it('should return case-insensitive tag suggestions', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const suggestions = await TagService.getTagSuggestions('Java');

      expect(suggestions).toContain('javascript');
    });

    it('should limit suggestions to specified count', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const suggestions = await TagService.getTagSuggestions('', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return most popular tags when query is empty', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const suggestions = await TagService.getTagSuggestions('');

      // Should return tags sorted by popularity
      expect(suggestions[0]).toBe('javascript'); // Most used
    });

    it('should sort suggestions by popularity', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const suggestions = await TagService.getTagSuggestions('');

      // Verify 'javascript' (appears 2x) comes before others (appear 1x)
      const jsIndex = suggestions.indexOf('javascript');
      const reactIndex = suggestions.indexOf('react');
      expect(jsIndex).toBeLessThan(reactIndex);
    });
  });

  describe('getTagUsageCount', () => {
    it('should return usage count map for all tags', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const usageMap = await TagService.getTagUsageCount();

      expect(usageMap.get('javascript')).toBe(2);
      expect(usageMap.get('tutorial')).toBe(1);
      expect(usageMap.get('react')).toBe(1);
      expect(usageMap.get('nodejs')).toBe(1);
      expect(usageMap.get('python')).toBe(1);
    });
  });

  describe('addTagToMoment', () => {
    it('should add tag to moment', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());
      (MomentStorage.updateMoment as jest.Mock).mockResolvedValue(undefined);

      await TagService.addTagToMoment('moment-1', 'newTag');

      expect(MomentStorage.updateMoment).toHaveBeenCalledWith('moment-1', {
        tags: expect.arrayContaining(['newTag']),
      });
    });

    it('should not add duplicate tags (case-insensitive)', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());
      (MomentStorage.updateMoment as jest.Mock).mockResolvedValue(undefined);

      await TagService.addTagToMoment('moment-1', 'JavaScript'); // Already has 'javascript'

      // Should not be called because tag already exists
      expect(MomentStorage.updateMoment).not.toHaveBeenCalled();
    });
  });

  describe('removeTagFromMoment', () => {
    it('should remove tag from moment (case-insensitive)', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());
      (MomentStorage.updateMoment as jest.Mock).mockResolvedValue(undefined);

      await TagService.removeTagFromMoment('moment-1', 'JavaScript'); // matches 'javascript'

      expect(MomentStorage.updateMoment).toHaveBeenCalledWith('moment-1', {
        tags: expect.not.arrayContaining(['javascript']),
      });
    });
  });

  describe('getMomentsByTag', () => {
    it('should return moments with specific tag', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const moments = await TagService.getMomentsByTag('javascript');

      expect(moments).toHaveLength(2);
      expect(moments[0].id).toBe('moment-1');
      expect(moments[1].id).toBe('moment-2');
    });

    it('should be case-insensitive', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());

      const moments = await TagService.getMomentsByTag('JavaScript');

      expect(moments).toHaveLength(2);
    });
  });

  describe('renameTagGlobally', () => {
    it('should rename tag across all moments', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());
      (MomentStorage.updateMoment as jest.Mock).mockResolvedValue(undefined);

      await TagService.renameTagGlobally('javascript', 'js');

      // Should update both moments that have 'javascript'
      expect(MomentStorage.updateMoment).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTagGlobally', () => {
    it('should delete tag from all moments', async () => {
      (MomentStorage.loadMoments as jest.Mock).mockResolvedValue(getSampleMoments());
      (MomentStorage.updateMoment as jest.Mock).mockResolvedValue(undefined);

      await TagService.deleteTagGlobally('javascript');

      // Should update both moments that have 'javascript'
      expect(MomentStorage.updateMoment).toHaveBeenCalledTimes(2);
    });
  });
});
