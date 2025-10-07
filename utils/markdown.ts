/**
 * Markdown formatting utilities for exporting moments
 * Supports Notion, Obsidian, and Plain Text formats
 */

import { Moment, YouTubeMoment, ScreenRecordingMoment } from '../types/moment';

export type ExportFormat = 'notion' | 'obsidian' | 'plain';

export interface ExportOptions {
  includeTags?: boolean;
  includeTimestamps?: boolean;
  includeNotes?: boolean;
}

/**
 * Format timestamp in seconds to HH:MM:SS or MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/`/g, '\\`');
}

/**
 * Generate YouTube URL with timestamp
 */
function getYouTubeUrlWithTimestamp(videoId: string, timestamp: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(timestamp)}s`;
}

/**
 * Format a single moment as Notion-compatible markdown
 */
export function formatMomentAsNotion(moment: Moment, options: ExportOptions = {}): string {
  const {
    includeTags = true,
    includeTimestamps = true,
    includeNotes = true,
  } = options;

  let output = '';

  // Title with timestamp
  if (includeTimestamps && moment.type === 'youtube') {
    const url = getYouTubeUrlWithTimestamp(
      (moment as YouTubeMoment).videoId,
      moment.timestamp
    );
    output += `### [${moment.title}](${url}) - ${formatTimestamp(moment.timestamp)}\n\n`;
  } else {
    output += `### ${moment.title}`;
    if (includeTimestamps) {
      output += ` - ${formatTimestamp(moment.timestamp)}`;
    }
    output += '\n\n';
  }

  // Notes
  if (includeNotes && moment.notes) {
    output += `${moment.notes}\n\n`;
  }

  // Tags
  if (includeTags && moment.tags && moment.tags.length > 0) {
    output += moment.tags.map(tag => `#${tag}`).join(' ') + '\n\n';
  }

  // Source info
  if (moment.type === 'screen-recording') {
    output += `> Screen Recording\n\n`;
  }

  return output;
}

/**
 * Generate Obsidian frontmatter YAML
 */
export function generateObsidianFrontmatter(
  videoTitle: string,
  moments: Moment[],
  videoUrl?: string
): string {
  const allTags = new Set<string>();
  moments.forEach(moment => {
    if (moment.tags) {
      moment.tags.forEach(tag => allTags.add(tag));
    }
  });

  let frontmatter = '---\n';
  frontmatter += `title: "${videoTitle}"\n`;
  frontmatter += `created: ${new Date().toISOString()}\n`;

  if (allTags.size > 0) {
    frontmatter += `tags:\n`;
    Array.from(allTags).forEach(tag => {
      frontmatter += `  - ${tag}\n`;
    });
  }

  if (videoUrl) {
    frontmatter += `source: "${videoUrl}"\n`;
  }

  frontmatter += '---\n\n';
  return frontmatter;
}

/**
 * Format a single moment as Obsidian-compatible markdown
 */
export function formatMomentAsObsidian(moment: Moment, options: ExportOptions = {}): string {
  const {
    includeTags = true,
    includeTimestamps = true,
    includeNotes = true,
  } = options;

  let output = '';

  // Title with timestamp and wikilink
  output += `## ${moment.title}`;
  if (includeTimestamps) {
    output += ` ^${formatTimestamp(moment.timestamp).replace(/:/g, '-')}`;
  }
  output += '\n\n';

  // Timestamp link for YouTube
  if (includeTimestamps && moment.type === 'youtube') {
    const url = getYouTubeUrlWithTimestamp(
      (moment as YouTubeMoment).videoId,
      moment.timestamp
    );
    output += `⏱️ [${formatTimestamp(moment.timestamp)}](${url})\n\n`;
  } else if (includeTimestamps) {
    output += `⏱️ ${formatTimestamp(moment.timestamp)}\n\n`;
  }

  // Notes
  if (includeNotes && moment.notes) {
    output += `${moment.notes}\n\n`;
  }

  // Tags
  if (includeTags && moment.tags && moment.tags.length > 0) {
    output += moment.tags.map(tag => `#${tag}`).join(' ') + '\n\n';
  }

  return output;
}

/**
 * Format a single moment as plain text
 */
export function formatMomentAsPlain(moment: Moment, options: ExportOptions = {}): string {
  const {
    includeTags = true,
    includeTimestamps = true,
    includeNotes = true,
  } = options;

  let output = '';

  // Title
  output += `${moment.title}`;
  if (includeTimestamps) {
    output += ` (${formatTimestamp(moment.timestamp)})`;
  }
  output += '\n';

  // URL for YouTube
  if (moment.type === 'youtube') {
    const url = getYouTubeUrlWithTimestamp(
      (moment as YouTubeMoment).videoId,
      moment.timestamp
    );
    output += `${url}\n`;
  }

  // Notes
  if (includeNotes && moment.notes) {
    output += `\n${moment.notes}\n`;
  }

  // Tags
  if (includeTags && moment.tags && moment.tags.length > 0) {
    output += `\nTags: ${moment.tags.join(', ')}\n`;
  }

  output += '\n---\n\n';
  return output;
}

/**
 * Format a moment based on the selected format
 */
export function formatMomentAsMarkdown(
  moment: Moment,
  format: ExportFormat,
  options: ExportOptions = {}
): string {
  switch (format) {
    case 'notion':
      return formatMomentAsNotion(moment, options);
    case 'obsidian':
      return formatMomentAsObsidian(moment, options);
    case 'plain':
      return formatMomentAsPlain(moment, options);
    default:
      return formatMomentAsPlain(moment, options);
  }
}

/**
 * Format multiple moments grouped by video
 */
export function formatMomentsGrouped(
  moments: Moment[],
  format: ExportFormat,
  options: ExportOptions = {},
  videoTitle?: string
): string {
  let output = '';

  // Add Obsidian frontmatter if applicable
  if (format === 'obsidian' && videoTitle) {
    const videoUrl = moments[0]?.type === 'youtube'
      ? `https://www.youtube.com/watch?v=${(moments[0] as YouTubeMoment).videoId}`
      : undefined;
    output += generateObsidianFrontmatter(videoTitle, moments, videoUrl);
  }

  // Add video title header
  if (videoTitle) {
    output += `# ${videoTitle}\n\n`;
  }

  // Add each moment
  moments.forEach((moment, index) => {
    output += formatMomentAsMarkdown(moment, format, options);

    // Add spacing between moments
    if (index < moments.length - 1) {
      output += '\n';
    }
  });

  return output;
}

/**
 * Estimate file size in bytes
 */
export function estimateFileSize(content: string): number {
  return new Blob([content]).size;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
