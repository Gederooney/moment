/**
 * ExportPreview Component
 * Shows formatted markdown preview before export
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { formatFileSize, estimateFileSize } from '../../utils/markdown';

interface ExportPreviewProps {
  content: string;
  darkMode?: boolean;
}

export function ExportPreview({ content, darkMode = false }: ExportPreviewProps) {
  const characterCount = content.length;
  const fileSize = estimateFileSize(content);

  return (
    <View style={styles.container}>
      {/* Preview area */}
      <ScrollView
        style={[styles.previewScroll, darkMode && styles.previewScrollDark]}
        contentContainerStyle={styles.previewContent}
      >
        <Text
          style={[styles.previewText, darkMode && styles.previewTextDark]}
          selectable
        >
          {content}
        </Text>
      </ScrollView>

      {/* Stats footer */}
      <View style={[styles.stats, darkMode && styles.statsDark]}>
        <Text style={[styles.statsText, darkMode && styles.statsTextDark]}>
          {characterCount.toLocaleString()} characters
        </Text>
        <Text style={[styles.separator, darkMode && styles.separatorDark]}>•</Text>
        <Text style={[styles.statsText, darkMode && styles.statsTextDark]}>
          ~{formatFileSize(fileSize)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewScrollDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#404040',
  },
  previewContent: {
    padding: 12,
  },
  previewText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },
  previewTextDark: {
    color: '#e0e0e0',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  statsDark: {
    borderTopColor: '#404040',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  statsTextDark: {
    color: '#999',
  },
  separator: {
    fontSize: 12,
    color: '#666',
  },
  separatorDark: {
    color: '#999',
  },
});
