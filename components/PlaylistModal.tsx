import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Colors, getColors } from '../constants/Colors';
import { usePlaylist, Playlist } from '../contexts/PlaylistContext';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  videoData: {
    videoId: string;
    title: string;
    author?: string;
    thumbnail?: string;
    url: string;
  };
  isDark?: boolean;
}

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

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, { backgroundColor: colors.background.secondary }]}
      onPress={() => handleAddToPlaylist(item)}
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
              <View
                style={[styles.createSection, { backgroundColor: colors.background.secondary }]}
              >
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
                  onChangeText={setNewPlaylistName}
                  maxLength={50}
                  autoFocus
                />
                <View style={styles.createButtons}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: colors.background.tertiary }]}
                    onPress={() => {
                      setIsCreating(false);
                      setNewPlaylistName('');
                    }}
                    disabled={isLoading}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.accent }]}
                    onPress={handleCreatePlaylist}
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
