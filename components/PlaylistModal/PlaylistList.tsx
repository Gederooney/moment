/**
 * PlaylistList Component
 * List of existing playlists
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { Playlist } from '../../contexts/PlaylistContext';

interface PlaylistListProps {
  playlists: Playlist[];
  isLoading: boolean;
  isDark: boolean;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const PlaylistList: React.FC<PlaylistListProps> = ({
  playlists,
  isLoading,
  isDark,
  onSelectPlaylist,
}) => {
  const colors = getColors(isDark);

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, { backgroundColor: colors.background.secondary }]}
      onPress={() => onSelectPlaylist(item)}
      disabled={isLoading}
    >
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistName, { color: colors.text.primary }]}>{item.name}</Text>
        <Text style={[styles.playlistCount, { color: colors.text.secondary }]}>
          {item.videos.length} vidéo{item.videos.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Ionicons name="add-circle" size={24} color={colors.accent} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={playlists}
      renderItem={renderPlaylistItem}
      keyExtractor={item => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
            Aucune playlist pour le moment
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
            Créez votre première playlist ci-dessus
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  playlistCount: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
