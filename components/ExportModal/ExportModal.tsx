/**
 * ExportModal Component
 * Modal for exporting moments to different formats
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SegmentedControlIOS,
  Platform,
} from 'react-native';
import { Moment } from '../../types/moment';
import { ExportFormat, ExportOptions } from '../../utils/markdown';
import { exportToClipboard, exportAndShare, getExportPreview } from '../../services/export';
import { ExportPreview } from './ExportPreview';

interface ExportModalProps {
  visible: boolean;
  moments: Moment[];
  videoTitle?: string;
  onClose: () => void;
  darkMode?: boolean;
}

const FORMATS: ExportFormat[] = ['notion', 'obsidian', 'plain'];
const FORMAT_LABELS = {
  notion: 'Notion',
  obsidian: 'Obsidian',
  plain: 'Plain Text',
};

export function ExportModal({
  visible,
  moments,
  videoTitle,
  onClose,
  darkMode = false,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('notion');
  const [includeTags, setIncludeTags] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const options: ExportOptions = {
    includeTags,
    includeTimestamps,
    includeNotes,
  };

  const previewContent = useMemo(() => {
    return getExportPreview(moments, selectedFormat, options, videoTitle);
  }, [moments, selectedFormat, options, videoTitle]);

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    const result = await exportToClipboard(moments, selectedFormat, options, videoTitle);
    setIsExporting(false);

    if (result.success) {
      Alert.alert('Success', result.message);
      onClose();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    const result = await exportAndShare(moments, selectedFormat, options, videoTitle);
    setIsExporting(false);

    if (result.success) {
      onClose();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderFormatSelector = () => {
    if (Platform.OS === 'ios') {
      return (
        <SegmentedControlIOS
          values={FORMATS.map(f => FORMAT_LABELS[f])}
          selectedIndex={FORMATS.indexOf(selectedFormat)}
          onChange={(event) => {
            setSelectedFormat(FORMATS[event.nativeEvent.selectedSegmentIndex]);
          }}
          style={styles.segmentedControl}
        />
      );
    }

    return (
      <View style={styles.formatButtons}>
        {FORMATS.map((format) => (
          <TouchableOpacity
            key={format}
            style={[
              styles.formatButton,
              darkMode && styles.formatButtonDark,
              selectedFormat === format && styles.formatButtonSelected,
              selectedFormat === format && darkMode && styles.formatButtonSelectedDark,
            ]}
            onPress={() => setSelectedFormat(format)}
          >
            <Text
              style={[
                styles.formatButtonText,
                darkMode && styles.formatButtonTextDark,
                selectedFormat === format && styles.formatButtonTextSelected,
              ]}
            >
              {FORMAT_LABELS[format]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, darkMode && styles.containerDark]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.headerButton, darkMode && styles.headerButtonDark]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
            Export Moments
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Format Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            Format
          </Text>
          {renderFormatSelector()}
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            Include
          </Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setIncludeTags(!includeTags)}
            >
              <View style={[styles.checkbox, includeTags && styles.checkboxChecked]}>
                {includeTags && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>
                Tags
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setIncludeTimestamps(!includeTimestamps)}
            >
              <View style={[styles.checkbox, includeTimestamps && styles.checkboxChecked]}>
                {includeTimestamps && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>
                Timestamps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setIncludeNotes(!includeNotes)}
            >
              <View style={[styles.checkbox, includeNotes && styles.checkboxChecked]}>
                {includeNotes && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>
                Notes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview */}
        <View style={[styles.section, styles.previewSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            Preview
          </Text>
          <ExportPreview content={previewContent} darkMode={darkMode} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, darkMode && styles.buttonSecondaryDark]}
            onPress={handleCopyToClipboard}
            disabled={isExporting}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Copy to Clipboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleShare}
            disabled={isExporting}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    fontSize: 16,
    color: '#1976d2',
    minWidth: 60,
  },
  headerButtonDark: {
    color: '#64b5f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerTitleDark: {
    color: '#e0e0e0',
  },
  headerSpacer: {
    minWidth: 60,
  },
  section: {
    padding: 16,
  },
  previewSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: '#999',
  },
  segmentedControl: {
    height: 32,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  formatButtonDark: {
    borderColor: '#404040',
    backgroundColor: '#1a1a1a',
  },
  formatButtonSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  formatButtonSelectedDark: {
    backgroundColor: '#64b5f6',
    borderColor: '#64b5f6',
  },
  formatButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  formatButtonTextDark: {
    color: '#e0e0e0',
  },
  formatButtonTextSelected: {
    color: '#fff',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1976d2',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextDark: {
    color: '#e0e0e0',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonSecondaryDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#333',
  },
});
