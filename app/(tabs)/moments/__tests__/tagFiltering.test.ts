/**
 * Tests for tag filtering functionality
 * Coverage: multi-tag filtering with AND logic
 */

/// <reference types="jest" />

import { TagService } from '../../../../services/tagService';
import { MomentStorage } from '../../../../services/momentStorage';
import { YouTubeMoment } from '../../../../types/moment';

jest.mock('../../../../services/momentStorage');

const MockedMomentStorage = MomentStorage as jest.Mocked<typeof MomentStorage>;

describe('Tag Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TagService.invalidateCache();
  });

  const createMockMoment = (id: string, tags: string[]): YouTubeMoment => ({
    id,
    type: 'youtube',
    videoId: 'video-1',
    timestamp: 0,
    duration: 10,
    title: `Moment ${id}`,
    notes: '',
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('Multi-tag filtering with AND logic', () => {
    it('should return moments that have all selected tags', async () => {
      const moments = [
        createMockMoment('m1', ['tutorial', 'react', 'advanced']),
        createMockMoment('m2', ['tutorial', 'react']),
        createMockMoment('m3', ['tutorial', 'vue']),
        createMockMoment('m4', ['react']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const result = await TagService.getMomentsByTags(['tutorial', 'react']);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('m1');
      expect(result[1].id).toBe('m2');
    });

    it('should return empty array when no moments match all tags', async () => {
      const moments = [
        createMockMoment('m1', ['tutorial']),
        createMockMoment('m2', ['react']),
        createMockMoment('m3', ['vue']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const result = await TagService.getMomentsByTags(['tutorial', 'react']);

      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive when filtering tags', async () => {
      const moments = [
        createMockMoment('m1', ['Tutorial', 'React']),
        createMockMoment('m2', ['TUTORIAL', 'REACT']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const result = await TagService.getMomentsByTags(['tutorial', 'react']);

      expect(result).toHaveLength(2);
    });

    it('should handle single tag filtering', async () => {
      const moments = [
        createMockMoment('m1', ['tutorial']),
        createMockMoment('m2', ['tutorial', 'advanced']),
        createMockMoment('m3', ['beginner']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const result = await TagService.getMomentsByTags(['tutorial']);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('m1');
      expect(result[1].id).toBe('m2');
    });

    it('should return empty array when filtering with empty tag array', async () => {
      const moments = [
        createMockMoment('m1', ['tutorial']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const result = await TagService.getMomentsByTags([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('Tag availability', () => {
    it('should get all unique tags from moments', async () => {
      const moments = [
        createMockMoment('m1', ['tutorial', 'react']),
        createMockMoment('m2', ['tutorial', 'vue']),
        createMockMoment('m3', ['advanced', 'react']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const tags = await TagService.getAllTags();

      expect(tags).toContain('tutorial');
      expect(tags).toContain('react');
      expect(tags).toContain('vue');
      expect(tags).toContain('advanced');
      expect(tags).toHaveLength(4);
    });

    it('should sort tags by usage count (most popular first)', async () => {
      const moments = [
        createMockMoment('m1', ['react', 'tutorial']),
        createMockMoment('m2', ['react', 'advanced']),
        createMockMoment('m3', ['react']),
        createMockMoment('m4', ['tutorial']),
      ];

      MockedMomentStorage.loadMoments.mockResolvedValue(moments);

      const tags = await TagService.getAllTags();

      // 'react' appears 3 times, 'tutorial' appears 2 times, 'advanced' appears 1 time
      expect(tags[0]).toBe('react');
      expect(tags[1]).toBe('tutorial');
      expect(tags[2]).toBe('advanced');
    });
  });
});
