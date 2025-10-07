/**
 * TagInput Component
 * Chip-based tag input with autocomplete suggestions
 * Prevents duplicate tags (case-insensitive)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { TagService } from '../../services/tagService';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  darkMode?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  darkMode = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length > 0) {
        const results = await TagService.getTagSuggestions(inputValue, 5);
        // Filter out already selected tags
        const filtered = results.filter(
          (suggestion) => !tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [inputValue, tags]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Check for duplicates (case-insensitive)
    const isDuplicate = tags.some(
      (existingTag) => existingTag.toLowerCase() === trimmedTag.toLowerCase()
    );

    if (!isDuplicate) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      Keyboard.dismiss();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleAddTag(suggestion);
  };

  const handleSubmitEditing = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tag chips */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View
            key={`${tag}-${index}`}
            style={[styles.tagChip, darkMode && styles.tagChipDark]}
          >
            <Text style={[styles.tagText, darkMode && styles.tagTextDark]}>
              #{tag}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveTag(tag)}
              style={styles.removeButton}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text style={[styles.removeButtonText, darkMode && styles.removeButtonTextDark]}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Input field */}
      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={darkMode ? '#666' : '#999'}
        style={[styles.input, darkMode && styles.inputDark]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />

      {/* Autocomplete suggestions */}
      {showSuggestions && (
        <View style={[styles.suggestionsContainer, darkMode && styles.suggestionsContainerDark]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectSuggestion(item)}
                style={styles.suggestionItem}
              >
                <Text style={[styles.suggestionText, darkMode && styles.suggestionTextDark]}>
                  #{item}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagChipDark: {
    backgroundColor: '#1e3a5f',
  },
  tagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  tagTextDark: {
    color: '#64b5f6',
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#bbdefb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
    lineHeight: 18,
  },
  removeButtonTextDark: {
    color: '#64b5f6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
    color: '#fff',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsContainerDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionTextDark: {
    color: '#e0e0e0',
  },
});
