/**
 * PlaylistModal Component
 * Modal for adding videos to playlists
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/Colors';
import { usePlaylist, Playlist } from '../../contexts/PlaylistContext';
import { PlaylistForm } from './PlaylistForm';
import { PlaylistList } from './PlaylistList';
import { PlaylistModalProps } from './types';

export function PlaylistModal({ visible, onClose, videoData, isDark = false }: PlaylistModalProps) {
  const colors = getColors(isDark);
  const { playlists, addVideoToPlaylist, createPlaylist } = usePlaylist();

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToPlaylist = useCallback(
    async (playlist: Playlist) => {
      setIsLoading(true);
      try {
        await addVideoToPlaylist(playlist.id, {
          videoId: videoData.videoId,
          title: videoData.title,
          author: videoData.author,
          thumbnail: videoData.thumbnail,
          url: videoData.url,
        });

        Alert.alert('Succès', `Vidéo ajoutée à "${playlist.name}"`, [
          { text: 'OK', onPress: onClose },
        ]);
      } catch (error) {
        console.error('Error adding video to playlist:', error);
        Alert.alert('Erreur', "Impossible d'ajouter la vidéo à la playlist");
      } finally {
        setIsLoading(false);
      }
    },
    [videoData, addVideoToPlaylist, onClose]
  );

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de playlist');
      return;
    }

    setIsLoading(true);
    try {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      await addVideoToPlaylist(newPlaylist.id, {
        videoId: videoData.videoId,
        title: videoData.title,
        author: videoData.author,
        thumbnail: videoData.thumbnail,
        url: videoData.url,
      });

      setNewPlaylistName('');
      setIsCreating(false);

      Alert.alert('Succès', `Playlist "${newPlaylist.name}" créée et vidéo ajoutée`, [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Erreur', 'Impossible de créer la playlist');
    } finally {
      setIsLoading(false);
    }
  }, [newPlaylistName, createPlaylist, addVideoToPlaylist, videoData, onClose]);

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewPlaylistName('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                Ajouter à une playlist
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Video info */}
            <View style={[styles.videoInfo, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.videoTitle, { color: colors.text.primary }]} numberOfLines={2}>
                {videoData.title}
              </Text>
              {videoData.author && (
                <Text style={[styles.videoAuthor, { color: colors.text.secondary }]}>
                  {videoData.author}
                </Text>
              )}
            </View>

            {/* Create new playlist section */}
            {isCreating ? (
              <PlaylistForm
                visible={isCreating}
                newPlaylistName={newPlaylistName}
                isLoading={isLoading}
                isDark={isDark}
                onNameChange={setNewPlaylistName}
                onCancel={handleCancelCreate}
                onCreate={handleCreatePlaylist}
              />
            ) : (
              <TouchableOpacity
                style={[styles.newPlaylistButton, { backgroundColor: colors.background.secondary }]}
                onPress={() => setIsCreating(true)}
                disabled={isLoading}
              >
                <Ionicons name="add" size={24} color={colors.accent} />
                <Text style={[styles.newPlaylistText, { color: colors.accent }]}>
                  Nouvelle playlist
                </Text>
              </TouchableOpacity>
            )}

            {/* Existing playlists */}
            <PlaylistList
              playlists={playlists}
              isLoading={isLoading}
              isDark={isDark}
              onSelectPlaylist={handleAddToPlaylist}
            />

            {/* Loading overlay */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    maxHeight: '80%',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  videoInfo: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  videoAuthor: {
    fontSize: 14,
  },
  newPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  newPlaylistText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
