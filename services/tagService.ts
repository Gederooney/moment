/**
 * Tag service for managing tags across moments
 * Provides autocomplete, suggestions, and tag usage analytics
 */

import { Moment } from '../types/moment';
import { MomentStorage } from './momentStorage';

export class TagService {
  /**
   * In-memory cache for tag index
   * Map<tag, usageCount>
   */
  private static tagCache: Map<string, number> | null = null;

  /**
   * Invalidate cache (call this when moments are added/updated/deleted)
   */
  static invalidateCache(): void {
    this.tagCache = null;
  }

  /**
   * Build tag cache from all moments
   */
  private static async buildCache(): Promise<Map<string, number>> {
    if (this.tagCache) {
      return this.tagCache;
    }

    const moments = await MomentStorage.loadMoments();
    const tagMap = new Map<string, number>();

    for (const moment of moments) {
      if (moment.tags && moment.tags.length > 0) {
        for (const tag of moment.tags) {
          const normalizedTag = tag.toLowerCase().trim();
          const currentCount = tagMap.get(normalizedTag) || 0;
          tagMap.set(normalizedTag, currentCount + 1);
        }
      }
    }

    this.tagCache = tagMap;
    return tagMap;
  }

  /**
   * Get all unique tags from all moments
   * Returns tags sorted by usage count (most popular first)
   */
  static async getAllTags(): Promise<string[]> {
    try {
      const tagMap = await this.buildCache();
      const tags = Array.from(tagMap.keys());

      // Sort by usage count (descending)
      tags.sort((a, b) => {
        const countA = tagMap.get(a) || 0;
        const countB = tagMap.get(b) || 0;
        return countB - countA;
      });

      return tags;
    } catch (error) {
      console.error('[TagService] Error getting all tags:', error);
      return [];
    }
  }

  /**
   * Get tag suggestions for autocomplete
   * Case-insensitive matching
   * Returns top 10 matching tags sorted by popularity
   */
  static async getTagSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query || query.trim() === '') {
        // If no query, return most popular tags
        const allTags = await this.getAllTags();
        return allTags.slice(0, limit);
      }

      const normalizedQuery = query.toLowerCase().trim();
      const tagMap = await this.buildCache();
      const matchingTags: string[] = [];

      for (const tag of tagMap.keys()) {
        if (tag.includes(normalizedQuery)) {
          matchingTags.push(tag);
        }
      }

      // Sort by usage count (descending)
      matchingTags.sort((a, b) => {
        const countA = tagMap.get(a) || 0;
        const countB = tagMap.get(b) || 0;
        return countB - countA;
      });

      return matchingTags.slice(0, limit);
    } catch (error) {
      console.error('[TagService] Error getting tag suggestions:', error);
      return [];
    }
  }

  /**
   * Get usage count for all tags
   * Returns Map<tag, count>
   */
  static async getTagUsageCount(): Promise<Map<string, number>> {
    try {
      return await this.buildCache();
    } catch (error) {
      console.error('[TagService] Error getting tag usage count:', error);
      return new Map();
    }
  }

  /**
   * Get usage count for a specific tag
   */
  static async getTagCount(tag: string): Promise<number> {
    try {
      const tagMap = await this.buildCache();
      const normalizedTag = tag.toLowerCase().trim();
      return tagMap.get(normalizedTag) || 0;
    } catch (error) {
      console.error('[TagService] Error getting tag count:', error);
      return 0;
    }
  }

  /**
   * Get top N most popular tags
   */
  static async getPopularTags(limit: number = 10): Promise<string[]> {
    try {
      const allTags = await this.getAllTags();
      return allTags.slice(0, limit);
    } catch (error) {
      console.error('[TagService] Error getting popular tags:', error);
      return [];
    }
  }

  /**
   * Get moments by tag
   */
  static async getMomentsByTag(tag: string): Promise<Moment[]> {
    try {
      const normalizedTag = tag.toLowerCase().trim();
      const moments = await MomentStorage.loadMoments();

      return moments.filter((moment) => {
        if (!moment.tags) return false;
        return moment.tags.some((t) => t.toLowerCase().trim() === normalizedTag);
      });
    } catch (error) {
      console.error('[TagService] Error getting moments by tag:', error);
      return [];
    }
  }

  /**
   * Get moments by multiple tags (AND logic - moment must have all tags)
   */
  static async getMomentsByTags(tags: string[]): Promise<Moment[]> {
    try {
      if (tags.length === 0) return [];

      const normalizedTags = tags.map((t) => t.toLowerCase().trim());
      const moments = await MomentStorage.loadMoments();

      return moments.filter((moment) => {
        if (!moment.tags || moment.tags.length === 0) return false;

        const momentTagsNormalized = moment.tags.map((t) => t.toLowerCase().trim());
        return normalizedTags.every((tag) => momentTagsNormalized.includes(tag));
      });
    } catch (error) {
      console.error('[TagService] Error getting moments by tags:', error);
      return [];
    }
  }

  /**
   * Add tag to a moment
   */
  static async addTagToMoment(momentId: string, tag: string): Promise<void> {
    try {
      const moments = await MomentStorage.loadMoments();
      const moment = moments.find((m) => m.id === momentId);

      if (!moment) {
        throw new Error(`Moment ${momentId} not found`);
      }

      const normalizedTag = tag.trim();

      if (!moment.tags) {
        moment.tags = [];
      }

      // Check if tag already exists (case-insensitive)
      const tagExists = moment.tags.some(
        (t) => t.toLowerCase() === normalizedTag.toLowerCase()
      );

      if (!tagExists) {
        moment.tags.push(normalizedTag);
        await MomentStorage.updateMoment(momentId, { tags: moment.tags });
        this.invalidateCache();
      }
    } catch (error) {
      console.error('[TagService] Error adding tag to moment:', error);
      throw new Error('Failed to add tag to moment');
    }
  }

  /**
   * Remove tag from a moment
   */
  static async removeTagFromMoment(momentId: string, tag: string): Promise<void> {
    try {
      const moments = await MomentStorage.loadMoments();
      const moment = moments.find((m) => m.id === momentId);

      if (!moment) {
        throw new Error(`Moment ${momentId} not found`);
      }

      if (!moment.tags) return;

      const normalizedTag = tag.toLowerCase().trim();
      moment.tags = moment.tags.filter((t) => t.toLowerCase().trim() !== normalizedTag);

      await MomentStorage.updateMoment(momentId, { tags: moment.tags });
      this.invalidateCache();
    } catch (error) {
      console.error('[TagService] Error removing tag from moment:', error);
      throw new Error('Failed to remove tag from moment');
    }
  }

  /**
   * Rename a tag globally (across all moments)
   */
  static async renameTagGlobally(oldTag: string, newTag: string): Promise<void> {
    try {
      const normalizedOldTag = oldTag.toLowerCase().trim();
      const normalizedNewTag = newTag.trim();

      const moments = await MomentStorage.loadMoments();
      const updatedMoments: Moment[] = [];

      for (const moment of moments) {
        if (!moment.tags) continue;

        const hasOldTag = moment.tags.some(
          (t) => t.toLowerCase().trim() === normalizedOldTag
        );

        if (hasOldTag) {
          moment.tags = moment.tags.map((t) =>
            t.toLowerCase().trim() === normalizedOldTag ? normalizedNewTag : t
          );
          updatedMoments.push(moment);
        }
      }

      // Update all affected moments
      for (const moment of updatedMoments) {
        await MomentStorage.updateMoment(moment.id, { tags: moment.tags });
      }

      this.invalidateCache();
    } catch (error) {
      console.error('[TagService] Error renaming tag globally:', error);
      throw new Error('Failed to rename tag');
    }
  }

  /**
   * Delete a tag globally (remove from all moments)
   */
  static async deleteTagGlobally(tag: string): Promise<void> {
    try {
      const normalizedTag = tag.toLowerCase().trim();
      const moments = await MomentStorage.loadMoments();
      const updatedMoments: Moment[] = [];

      for (const moment of moments) {
        if (!moment.tags) continue;

        const hadTag = moment.tags.some((t) => t.toLowerCase().trim() === normalizedTag);

        if (hadTag) {
          moment.tags = moment.tags.filter(
            (t) => t.toLowerCase().trim() !== normalizedTag
          );
          updatedMoments.push(moment);
        }
      }

      // Update all affected moments
      for (const moment of updatedMoments) {
        await MomentStorage.updateMoment(moment.id, { tags: moment.tags });
      }

      this.invalidateCache();
    } catch (error) {
      console.error('[TagService] Error deleting tag globally:', error);
      throw new Error('Failed to delete tag');
    }
  }

  /**
   * Get total number of unique tags
   */
  static async getTagCount(): Promise<number> {
    try {
      const tagMap = await this.buildCache();
      return tagMap.size;
    } catch (error) {
      console.error('[TagService] Error getting tag count:', error);
      return 0;
    }
  }
}
