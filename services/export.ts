/**
 * Export service for moments
 * Handles clipboard, file, and share functionality
 */

import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Moment } from '../types/moment';
import {
  formatMomentsGrouped,
  formatMomentAsMarkdown,
  ExportFormat,
  ExportOptions,
} from '../utils/markdown';

export interface ExportResult {
  success: boolean;
  message?: string;
  filePath?: string;
}

/**
 * Export moments to clipboard
 */
export async function exportToClipboard(
  moments: Moment[],
  format: ExportFormat,
  options: ExportOptions = {},
  videoTitle?: string
): Promise<ExportResult> {
  try {
    const content = formatMomentsGrouped(moments, format, options, videoTitle);
    await Clipboard.setStringAsync(content);

    return {
      success: true,
      message: `Copied ${moments.length} moment${moments.length !== 1 ? 's' : ''} to clipboard`,
    };
  } catch (error) {
    console.error('[ExportService] Error copying to clipboard:', error);
    return {
      success: false,
      message: 'Failed to copy to clipboard',
    };
  }
}

/**
 * Export moments to markdown file
 */
export async function exportToFile(
  moments: Moment[],
  format: ExportFormat,
  options: ExportOptions = {},
  videoTitle?: string
): Promise<ExportResult> {
  try {
    const content = formatMomentsGrouped(moments, format, options, videoTitle);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = videoTitle
      ? videoTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50)
      : 'moments';
    const filename = `${sanitizedTitle}_${timestamp}.md`;

    // Create file path
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      success: true,
      message: `Exported to ${filename}`,
      filePath,
    };
  } catch (error) {
    console.error('[ExportService] Error exporting to file:', error);
    return {
      success: false,
      message: 'Failed to export to file',
    };
  }
}

/**
 * Share exported file using system share sheet
 */
export async function shareFile(filePath: string): Promise<ExportResult> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      return {
        success: false,
        message: 'Sharing is not available on this device',
      };
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'text/markdown',
      dialogTitle: 'Share moments',
    });

    return {
      success: true,
      message: 'Shared successfully',
    };
  } catch (error) {
    console.error('[ExportService] Error sharing file:', error);
    return {
      success: false,
      message: 'Failed to share file',
    };
  }
}

/**
 * Export and share in one step
 */
export async function exportAndShare(
  moments: Moment[],
  format: ExportFormat,
  options: ExportOptions = {},
  videoTitle?: string
): Promise<ExportResult> {
  const exportResult = await exportToFile(moments, format, options, videoTitle);

  if (!exportResult.success || !exportResult.filePath) {
    return exportResult;
  }

  return await shareFile(exportResult.filePath);
}

/**
 * Get export preview text
 */
export function getExportPreview(
  moments: Moment[],
  format: ExportFormat,
  options: ExportOptions = {},
  videoTitle?: string
): string {
  return formatMomentsGrouped(moments, format, options, videoTitle);
}
