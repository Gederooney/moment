/**
 * PlaylistForm Component
 * Form for creating new playlists
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getColors } from '../../constants/Colors';
import { PlaylistFormProps } from './types';

export const PlaylistForm: React.FC<PlaylistFormProps> = ({
  visible,
  newPlaylistName,
  isLoading,
  isDark,
  onNameChange,
  onCancel,
  onCreate,
}) => {
  const colors = getColors(isDark);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.createSection, { backgroundColor: colors.background.secondary }]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light,
            color: colors.text.primary,
          },
        ]}
        placeholder="Nom de la playlist"
        placeholderTextColor={colors.text.tertiary}
        value={newPlaylistName}
        onChangeText={onNameChange}
        maxLength={50}
        autoFocus
      />
      <View style={styles.createButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.background.tertiary }]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>
            Annuler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.accent }]}
          onPress={onCreate}
          disabled={isLoading || !newPlaylistName.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  createSection: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
