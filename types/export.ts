/**
 * Export types for exporting moments to Notion, Obsidian, and other formats
 */

export type ExportFormat = 'notion' | 'obsidian' | 'plain' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeTags: boolean;
  includeTimestamps: boolean;
  includeNotes: boolean;
  includeMetadata: boolean; // video title, author, date created
  groupByVideo: boolean; // group moments by video or flat list
}

export interface ExportResult {
  success: boolean;
  content?: string; // formatted export content
  filePath?: string; // path to exported file (if saved locally)
  error?: string;
  format: ExportFormat;
}

export interface NotionExportConfig {
  apiKey?: string;
  databaseId?: string;
  useBlocks: boolean; // use Notion blocks syntax
}

export interface ObsidianExportConfig {
  vaultPath?: string;
  useFrontmatter: boolean;
  useWikiLinks: boolean; // [[link]] vs [link](url)
  tagPrefix: string; // '#' or 'tags:'
}

export interface ExportPreview {
  format: ExportFormat;
  content: string;
  momentCount: number;
  videoCount: number;
  estimatedSize: number; // in bytes
}

/**
 * Metadata for exported moments
 */
export interface ExportMetadata {
  exportedAt: Date;
  format: ExportFormat;
  totalMoments: number;
  totalVideos: number;
  appVersion: string;
}

/**
 * Export service interface
 */
export interface ExportService {
  exportToClipboard: (content: string) => Promise<void>;
  exportToFile: (content: string, filename: string, format: ExportFormat) => Promise<string>;
  shareFile: (filePath: string) => Promise<void>;
  generatePreview: (moments: any[], options: ExportOptions) => ExportPreview;
  formatAsNotion: (moments: any[], options: ExportOptions) => string;
  formatAsObsidian: (moments: any[], options: ExportOptions) => string;
  formatAsMarkdown: (moments: any[], options: ExportOptions) => string;
  formatAsPlainText: (moments: any[], options: ExportOptions) => string;
}
