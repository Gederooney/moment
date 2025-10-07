/**
 * TagFilterChips Component
 * Display available tags as selectable chips for filtering
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface TagFilterChipsProps {
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearAll?: () => void;
  darkMode?: boolean;
}

export function TagFilterChips({
  availableTags,
  selectedTags,
  onToggleTag,
  onClearAll,
  darkMode = false,
}: TagFilterChipsProps) {
  if (availableTags.length === 0) {
    return null;
  }

  const isTagSelected = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    return selectedTags.some(t => t.toLowerCase().trim() === normalizedTag);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTags.length > 0 && (
          <TouchableOpacity
            style={[styles.chip, styles.clearChip]}
            onPress={onClearAll}
          >
            <Text style={styles.clearChipText}>✕ Clear</Text>
          </TouchableOpacity>
        )}

        {availableTags.map((tag) => {
          const selected = isTagSelected(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.chip,
                darkMode && styles.chipDark,
                selected && styles.chipSelected,
                selected && darkMode && styles.chipSelectedDark,
              ]}
              onPress={() => onToggleTag(tag)}
            >
              <Text
                style={[
                  styles.chipText,
                  darkMode && styles.chipTextDark,
                  selected && styles.chipTextSelected,
                  selected && darkMode && styles.chipTextSelectedDark,
                ]}
              >
                {selected ? '✓ ' : ''}#{tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
  },
  chipSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  chipSelectedDark: {
    backgroundColor: '#64b5f6',
    borderColor: '#64b5f6',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chipTextDark: {
    color: '#e0e0e0',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipTextSelectedDark: {
    color: '#000',
  },
  clearChip: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  clearChipText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
